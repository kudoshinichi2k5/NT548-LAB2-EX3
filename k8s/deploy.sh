#!/bin/bash
kubectl apply -f namespace.yaml
kubectl apply -f secret-user.yaml
kubectl apply -f secret-recipe.yaml
kubectl apply -f user-service-all.yaml
kubectl apply -f recipe-service-all.yaml