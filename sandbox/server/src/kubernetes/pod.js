import {k8sCoreApi} from './config.js'

export async function createPod(sandboxId){

    const podManifest={
        metadata:{  
            name:`sandbox-pod-${sandboxId}`,
            labels:{
                app: 'sandbox',
                sandboxId:sandboxId
            }
        },
        spec:{
            volumes:[
                {
                    name: 'workspace-volumes',
                    emptyDir: {}
                }
            ],
            initContainers:[
                {
                    name:'init-container',
                    image:'template',
                    imagePullPolicy:'IfNotPresent',
                    command:['sh','-c','cp -r /workspace/. /seed/'],
                    volumeMounts:[
                        {
                            name:'workspace-volumes',
                            mountPath:'/seed'
                        }
                    ]
                }
            ],
            containers:[
                {   
                   image: 'template',
                   imagePullPolicy: 'IfNotPresent',
                   name: `sandbox-container`,
                    ports:[{containerPort:5173,name:'http'}],
                     resources: {limits: {cpu: '500m',memory: '1Gi'},
                        requests: {cpu: '250m',memory: '500Mi'}},
                    volumeMounts:[
                        {
                            name:'workspace-volumes',
                            mountPath:'/workspace'
                        }
                    ]
                },
                {
                    image:'agent',
                    imagePullPolicy:'IfNotPresent',
                    name:'agent-container',
                    ports:[{containerPort:3000,name:'http'}],  
                        resources: {limits: {cpu: '500m', memory: '1Gi'},
                        requests: {cpu: '250m',memory: '500Mi'}},
                    volumeMounts:[
                        {
                            name:'workspace-volumes',   
                            mountPath:'/workspace'
                        }
                    ]
                }
            ]
        }
    }


const response=await k8sCoreApi.createNamespacedPod({
    namespace:'default',
    body:podManifest
})

    return response

}
