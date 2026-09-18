// Azure Container Apps. Build and push the Dockerfile to ACR first:
//   az acr build -r <registry> -t rznish-gallery:latest .
// then deploy:
//   az deployment group create -g <rg> -f deploy/azure-container-app.bicep \
//     -p registry=<registry> environmentId=<managed-env-id>

param location string = resourceGroup().location
param name string = 'rznish-gallery'
param registry string
param environmentId string
param imageTag string = 'latest'

resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          server: '${registry}.azurecr.io'
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: name
          image: '${registry}.azurecr.io/${name}:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'HOSTNAME', value: '0.0.0.0' }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
  identity: { type: 'SystemAssigned' }
}

output url string = 'https://${app.properties.configuration.ingress.fqdn}'
