pipeline {
    agent { label 'agent' }

    tools {
        jdk 'jdk21'
        nodejs 'node21'
    }

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Định nghĩa tên Image
        USER_IMAGE = "kiennlt/cookmate-user"
        RECIPE_IMAGE = "kiennlt/cookmate-recipe"
        FE_IMAGE = "kiennlt/cookmate-fe"

        DOCKER_CREDS_ID = 'docker-hub-token'
        SONAR_TOKEN_ID = 'sonar-token'

        DOCKER_HUB_USER = 'kiennlt'

        DEPLOY_HOST_IP = '192.168.40.158' 
        DEPLOY_USER = 'kienlt'
    }

    stages {
        stage('SCM Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/kudoshinichi2k5/NT548-LAB2-EX3.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Skipping npm install on agent, Docker build handles dependencies.'
            }
        }

        stage('Run SonarQube') {
            environment {
                scannerHome = tool 'sonar-scanner'
            }
            steps {
                withSonarQubeEnv('sonar-server') {
                    withCredentials([string(credentialsId: "${SONAR_TOKEN_ID}", variable: 'SONAR_TOKEN')]) {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=cookmate-app \
                            -Dsonar.projectName=cookmate-app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://sonarqube:9000 \
                            -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Docker Build') {
            when { 
                changeset "**/*" 
            }
            steps {
                script {
                    echo '--- Building Images ---'
                    
                    dir('microservices-app/user-service') {
                        sh "docker build -t ${USER_IMAGE}:${IMAGE_TAG} ."
                    }
                    
                    dir('microservices-app/recipe-service') {
                        sh "docker build -t ${RECIPE_IMAGE}:${IMAGE_TAG} ."
                    }

                    dir('microservices-app/fe-app') {
                        sh "docker build -t ${FE_IMAGE}:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Scan with Trivy') {
            when { 
                changeset "**/*" 
            }
            steps {
                script {
                    sh "trivy image --severity CRITICAL,HIGH --format table --output trivy-user.txt ${USER_IMAGE}:${IMAGE_TAG}"
                    sh "trivy image --severity CRITICAL,HIGH --format table --output trivy-recipe.txt ${RECIPE_IMAGE}:${IMAGE_TAG}"
                    sh "trivy image --severity CRITICAL,HIGH --format table --output trivy-fe.txt ${FE_IMAGE}:${IMAGE_TAG}"
                    
                    // In ra màn hình để xem log ngay lập tức
                    sh "cat trivy-user.txt"
                }
            }
        }

        stage('Push to Docker Hub') {
            when { 
                changeset "**/*" 
            }
            steps {
                withCredentials([string(credentialsId: "${DOCKER_CREDS_ID}", variable: 'DOCKER_TOKEN')]) {
                    sh '''
                        # Dùng biến DOCKER_HUB_USER (đã khai báo ở đầu file) làm username
                        echo "${DOCKER_TOKEN}" | docker login -u ${DOCKER_HUB_USER} --password-stdin
                        
                        docker push ${USER_IMAGE}:${IMAGE_TAG}
                        docker push ${RECIPE_IMAGE}:${IMAGE_TAG}
                        docker push ${FE_IMAGE}:${IMAGE_TAG}
                    '''
                }
            }
        }
        
        stage('Deploy to Minikube via SSH') {
            steps {
                dir('k8s') {
                    script {
                        echo '🚀 Preparing Deployment Files...'
                        
                        sh "sed -i 's|image: kiennlt/cookmate-fe:.*|image: ${FE_IMAGE}:${IMAGE_TAG}|g' fe.yaml"
                        sh "sed -i 's|image: kiennlt/cookmate-user:.*|image: ${USER_IMAGE}:${IMAGE_TAG}|g' user-service-all.yaml"
                        sh "sed -i 's|image: kiennlt/cookmate-recipe:.*|image: ${RECIPE_IMAGE}:${IMAGE_TAG}|g' recipe-service-all.yaml"
                        
                        echo '🚀 Copying files to Host and Deploying...'
                        
                        sshagent(credentials: ['deploy-server-ssh']) {
                            sh """
                                # A. Tạo thư mục deploy trên máy Host (nếu chưa có)
                                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST_IP} 'mkdir -p ~/cookmate-deploy'

                                # B. Copy toàn bộ file trong thư mục k8s hiện tại (đã sửa tag) sang máy Host
                                # Lệnh scp giúp đảm bảo Host nhận được đúng phiên bản YAML vừa build xong
                                scp -o StrictHostKeyChecking=no * ${DEPLOY_USER}@${DEPLOY_HOST_IP}:~/cookmate-deploy/

                                # C. SSH vào Host và chạy script deploy.sh
                                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST_IP} '
                                    cd ~/cookmate-deploy
                                    chmod +x deploy.sh
                                    
                                    # Chạy script deploy (kubectl trên Host sẽ thực thi lệnh này)
                                    ./deploy.sh
                                    
                                    # Kiểm tra trạng thái sau khi deploy
                                    kubectl get pods -n cookmate
                                '
                            """
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '*.txt', fingerprint: true, allowEmptyArchive: true
        }
    }
}