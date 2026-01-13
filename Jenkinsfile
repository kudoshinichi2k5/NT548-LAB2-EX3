pipeline {
    agent { label 'agent' }
    
    tools {
        jdk 'jdk21'
        nodejs 'node21'
    }

    environment {
        // Tag image theo số build
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Định nghĩa tên Image (Khớp với Docker Hub của bạn)
        USER_IMAGE = "kiennlt/cookmate-user"
        RECIPE_IMAGE = "kiennlt/cookmate-recipe"
        FE_IMAGE = "kiennlt/cookmate-fe" 
        
        // ID Credential lưu trong Jenkins (Bạn cần tạo trước)
        DOCKER_CREDS_ID = 'dockerhub-creds'
        SONAR_TOKEN_ID = 'sonar-token'
    }

    stages {
        stage('SCM Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/kudoshinichi2k5/NT548-LAB2-EX3.git'
            }
        }

        stage("Run SonarQube scan") {
            environment {
                scannerHome = tool 'sonar-scanner'
            }
            steps {
                withSonarQubeEnv('sonar-server') {
                    // Dùng credential để bảo mật token
                    withCredentials([string(credentialsId: "${SONAR_TOKEN_ID}", variable: 'SONAR_TOKEN')]) {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=cookmate-app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://192.168.40.158:9001 \
                            -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    // Build User Service
                    echo '--- Building User Service ---'
                    dir('microservices-app/user-service') {
                        sh "docker build -t ${USER_IMAGE}:${IMAGE_TAG} ."
                    }
                    
                    // Build Recipe Service
                    echo '--- Building Recipe Service ---'
                    dir('microservices-app/recipe-service') {
                        sh "docker build -t ${RECIPE_IMAGE}:${IMAGE_TAG} ."
                    }

                    // Build Frontend App
                    echo '--- Building Frontend App ---'
                    dir('microservices-app/fe-app') {
                        sh "docker build -t ${FE_IMAGE}:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Scan with Trivy') {
            steps {
                // Quét lỗ hổng bảo mật cho cả 3 image
                sh "trivy image --severity CRITICAL,HIGH ${USER_IMAGE}:${IMAGE_TAG}"
                sh "trivy image --severity CRITICAL,HIGH ${RECIPE_IMAGE}:${IMAGE_TAG}"
                sh "trivy image --severity CRITICAL,HIGH ${FE_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'docker-hub-token', variable: 'DOCKER_TOKEN')]) {
                        // Login Docker Hub
                        sh '''
                            echo "$DOCKER_TOKEN" | docker login -u kiennlt --password-stdin
                            docker push ${USER_IMAGE}:${IMAGE_TAG}
                            docker push ${RECIPE_IMAGE}:${IMAGE_TAG}
                            docker push ${FE_IMAGE}:${IMAGE_TAG}
                        '''
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                dir('k8s') {
                    script {
                        echo 'Deploying...'
                        
                        // 1. Cập nhật file YAML với Image Tag mới nhất
                        // Frontend
                        sh "sed -i 's|image: kiennlt/cookmate-fe:.*|image: ${FE_IMAGE}:${IMAGE_TAG}|g' fe.yaml"
                        // User Service
                        sh "sed -i 's|image: kiennlt/cookmate-user:.*|image: ${USER_IMAGE}:${IMAGE_TAG}|g' user-service-all.yaml"
                        // Recipe Service
                        sh "sed -i 's|image: kiennlt/cookmate-recipe:.*|image: ${RECIPE_IMAGE}:${IMAGE_TAG}|g' recipe-service-all.yaml"
                        
                        // 2. Chạy script deploy
                        // Cấp quyền thực thi và chạy deploy.sh
                        sh "chmod +x deploy.sh"
                        sh "./deploy.sh"
                    }
                }
            }
        }
    }
}