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

        // ID Credentials (khớp với báo cáo/cấu hình của bạn)
        DOCKER_CREDS_ID = 'docker-hub-token'
        SONAR_TOKEN_ID = 'sonar-token'
    }

    stages {
        stage('SCM Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/kudoshinichi2k5/NT548-LAB2-EX3.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Bước này tùy chọn, nếu bạn muốn test cài đặt npm trước khi build docker
                // Nếu không cần thiết (vì Docker build sẽ tự làm) thì có thể bỏ qua để tiết kiệm thời gian
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
            steps {
                script {
                    // Build song song hoặc tuần tự các image
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
            steps {
                script {
                    // Quét và xuất ra file báo cáo để lưu trữ (giống pipeline mẫu)
                    sh "trivy image --severity CRITICAL,HIGH --format table --output trivy-user.txt ${USER_IMAGE}:${IMAGE_TAG}"
                    sh "trivy image --severity CRITICAL,HIGH --format table --output trivy-recipe.txt ${RECIPE_IMAGE}:${IMAGE_TAG}"
                    sh "trivy image --severity CRITICAL,HIGH --format table --output trivy-fe.txt ${FE_IMAGE}:${IMAGE_TAG}"
                    
                    // In ra màn hình để xem log ngay lập tức
                    sh "cat trivy-user.txt"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", passwordVariable: 'DOCKER_TOKEN', usernameVariable: 'DOCKER_USER')]) {
                    sh '''
                        echo "${DOCKER_TOKEN}" | docker login -u ${DOCKER_USER} --password-stdin
                        docker push ${USER_IMAGE}:${IMAGE_TAG}
                        docker push ${RECIPE_IMAGE}:${IMAGE_TAG}
                        docker push ${FE_IMAGE}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                dir('k8s') {
                    script {
                        echo '🚀 Deploying to Kubernetes...'
                        
                        // 1. Cập nhật file YAML với Image Tag mới nhất
                        sh "sed -i 's|image: kiennlt/cookmate-fe:.*|image: ${FE_IMAGE}:${IMAGE_TAG}|g' fe.yaml"
                        sh "sed -i 's|image: kiennlt/cookmate-user:.*|image: ${USER_IMAGE}:${IMAGE_TAG}|g' user-service-all.yaml"
                        sh "sed -i 's|image: kiennlt/cookmate-recipe:.*|image: ${RECIPE_IMAGE}:${IMAGE_TAG}|g' recipe-service-all.yaml"
                        
                        // 2. Chạy script deploy
                        // Lưu ý: Agent cần có quyền kubectl tới cluster
                        sh "chmod +x deploy.sh"
                        sh "./deploy.sh"
                    }
                }
            }
        }
    }
    
    // Lưu trữ báo cáo scan sau khi chạy xong (học từ pipeline mẫu)
    post {
        always {
            archiveArtifacts artifacts: '*.txt', fingerprint: true, allowEmptyArchive: true
        }
    }
}