import {k8sCoreApi} from './config.js'


export const createService=async (sandboxId)=>{

    const serviceManifest={
        metadata:{
            name:`sandbox-service-${sandboxId}`,
            labels:{
                app: "sandbox",
                sandboxId:sandboxId
            }
        },
        spec:{
            selector:{
                app: 'sandbox',
                sandboxId:sandboxId
            },
            ports:[
                {
                    port: 80,
                    protocol: 'TCP',
                    targetPort: 5173,
                    name: 'http'
                },
                {
                    port: 3000,
                    protocol: 'TCP',
                    targetPort: 3000,
                    name: 'agent-http'
                }
            ],
            type: 'ClusterIP'
        }
    }

    const response=await k8sCoreApi.createNamespacedService({
        namespace:'default',
        body:serviceManifest
    })

    return response

}