pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = '746430304915.dkr.ecr.ap-south-1.amazonaws.com'
        APP_DIR = '/home/ubuntu/smart-task-rishi'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/rishivenkateshmkiaq/smart-task-rishi.git'
            }
        }

        stage('Validate') {
            steps {
                sh '''
                    set -e
                    test -f docker-compose.ecr.yml
                    test -f frontend/Dockerfile
                    test -f auth-service_1784011000189/Dockerfile
                    test -f task-service/Dockerfile
                    test -f notification-service/Dockerfile
                    test -f report-service/Dockerfile
                    test -f api-gateway_1784010924579/Dockerfile
                    echo "Source validation successful"
                '''
            }
        }

        stage('AWS ECR Login') {
            steps {
                sh '''
                    set -e
                    aws sts get-caller-identity
                    aws ecr get-login-password --region "$AWS_REGION" |
                    docker login --username AWS --password-stdin "$ECR_REGISTRY"
                '''
            }
        }

        stage('Build and Push Images') {
            steps {
                sh '''
                    set -e

                    docker build -t $ECR_REGISTRY/smart-task-auth-service:$IMAGE_TAG ./auth-service_1784011000189
                    docker build -t $ECR_REGISTRY/smart-task-task-service:$IMAGE_TAG ./task-service
                    docker build -t $ECR_REGISTRY/smart-task-notification-service:$IMAGE_TAG ./notification-service
                    docker build -t $ECR_REGISTRY/smart-task-report-service:$IMAGE_TAG ./report-service
                    docker build -t $ECR_REGISTRY/smart-task-api-gateway:$IMAGE_TAG ./api-gateway_1784010924579
                    docker build -t $ECR_REGISTRY/smart-task-frontend:$IMAGE_TAG ./frontend

                    for service in auth-service task-service notification-service report-service api-gateway frontend
                    do
                        docker tag $ECR_REGISTRY/smart-task-$service:$IMAGE_TAG $ECR_REGISTRY/smart-task-$service:latest
                        docker push $ECR_REGISTRY/smart-task-$service:$IMAGE_TAG
                        docker push $ECR_REGISTRY/smart-task-$service:latest
                    done
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                    set -e
                    cd "$APP_DIR"

                    export IMAGE_TAG="$IMAGE_TAG"

                    docker compose -p smart-task-rishi \
                        -f docker-compose.ecr.yml pull

                    docker compose -p smart-task-rishi \
                        -f docker-compose.ecr.yml up -d

                    docker compose -p smart-task-rishi \
                        -f docker-compose.ecr.yml ps
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e
                    sleep 10
                    curl -fsS http://127.0.0.1:5000/health
                    curl -fsSI http://127.0.0.1:8081
                    echo "Deployment verification successful"
                '''
            }
        }
    }

    post {
        success {
            echo 'Smart Task CI/CD Pipeline Completed Successfully'
        }
        failure {
            echo 'Smart Task CI/CD Pipeline Failed'
        }
    }
}
EOF
