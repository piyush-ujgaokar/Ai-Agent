import * as k8sApi from '@kubernetes/client-node'

const kc = new k8sApi.KubeConfig()

// Prefer in-cluster configuration when running inside Kubernetes,
// otherwise fall back to the user's kubeconfig (e.g. ~/.kube/config).
try {
	kc.loadFromCluster()
} catch (err) {
	kc.loadFromDefault()
}

export const k8sCoreApi = kc.makeApiClient(k8sApi.CoreV1Api)