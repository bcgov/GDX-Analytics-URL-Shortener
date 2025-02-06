# Deploying MongoDB on OpenShift using Helm

This guide provides a simple way to deploy MongoDB in OpenShift using Helm. Make sure to Adjust the `values.yaml` file as per your environment's needs. Helm will deploy the database as stateful set rather than a deployment

## Prerequisites

Before deploying MongoDB using Helm, ensure you have the following:

- OpenShift CLI (`oc`) installed and configured
- Helm installed (`helm version` to check), use brew to install it
```sh
brew install helm
```
- A configured OpenShift project/namespace
- A `values.yaml` file with your custom configurations

## Step 1: Add the Bitnami Helm Repository

First, add the Bitnami Helm repository to fetch the latest MongoDB chart:

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

## Step 2: Create or Update the `values.yaml` File

Customize your `values.yaml` file as needed. You can find already customized values file for dev (values_dev.yaml) and test(values_test.yaml) in this folder


## Step 3: Deploy MongoDB using Helm

Download the values.yaml file to your local Desktop and then go to that directory using terminal

Run the following command to install or upgrade MongoDB with your custom values:

```sh
helm upgrade --install -f values.yaml mongodb-<env> bitnami/mongodb -n <namespace>
```

Replace `<namespace>` with your OpenShift project namespace and `<env>` with you envrionment such as dev, test or prod

For our Dev environment in Openshift we use the following command to install or upgrade the MongoDB deployment

```sh
helm upgrade --install -f values-dev.yaml mongodb-dev bitnami/mongodb -n c6d33e-dev
```

For our Test environment in Openshift we use the following command to install or upgrade the MongoDB deployment

```sh
helm upgrade --install -f values-test.yaml mongodb-test bitnami/mongodb -n c6d33e-test
```

## Step 4: Verify the Deployment

Check if the MongoDB pod is running:

```sh
oc get pods -n <namespace>
```

Check if the Persistent Volume Claim (PVC) is bound:

```sh
oc get pvc -n <namespace>
```

## Step 5: Uninstall MongoDB if Needed

To remove MongoDB, run:

```sh
helm uninstall mongodb-<env> -n <namespace>
```

It doesn't delete the attached PVC, so if you need to delete persistent data:

```sh
oc delete pvc -l app.kubernetes.io/name=mongodb -n <namespace>
```

## Notes

- Ensure the MongoDB secret (`mongodb-dev`) or (`mongodb-test`) exists before deployment with atleast these values
  mongodb-database
  mongodb-password
  mongodb-replica-set-key
  mongodb-root-password
  mongodb-username

- Persistent storage is retained even after uninstalling unless manually deleted.



