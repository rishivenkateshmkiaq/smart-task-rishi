
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = '746430304915.dkr.ecr.ap-south-1.amazonaws.com'
        APP_DIR = '/home/ubuntu/smart-task-rishi'
        COMPOSE_PROJECT = 'smart-task-rishi'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/rishivenkateshmkiaq/smart-task-rishi.git'
            }
        }

        stage('Validate Source') {
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

                    aws ecr get-login-password \
                        --region "$AWS_REGION" |
                    docker login \
                        --username AWS \
                        --password-stdin "$ECR_REGISTRY"

                    echo "ECR login successful"
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e

                    docker build -t "$ECR_REGISTRY/smart-task-auth-service:$IMAGE_TAG" ./auth-service_1784011000189

                    docker build -t "$ECR_REGISTRY/smart-task-task-service:$IMAGE_TAG" ./task-service

                    docker build -t "$ECR_REGISTRY/smart-task-notification-service:$IMAGE_TAG" ./notification-service

                    docker build -t "$ECR_REGISTRY/smart-task-report-service:$IMAGE_TAG" ./report-service

                    docker build -t "$ECR_REGISTRY/smart-task-api-gateway:$IMAGE_TAG" ./api-gateway_1784010924579

                    docker build -t "$ECR_REGISTRY/smart-task-frontend:$IMAGE_TAG" ./frontend

                    echo "All images built successfully"
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    set -e

                    for service in auth-service task-service notification-service report-service api-gateway frontend
                    do
                        IMAGE="$ECR_REGISTRY/smart-task-$service"

                        docker tag "$IMAGE:$IMAGE_TAG" "$IMAGE:latest"

                        docker push "$IMAGE:$IMAGE_TAG"
                        docker push "$IMAGE:latest"
                    done

                    echo "All images pushed successfully"
                '''
            }
        }

        stage('Deploy Docker Compose') {
            steps {
                sh '''
                    set -e

                    test -r "$APP_DIR/.env"

                    docker compose \
                        --env-file "$APP_DIR/.env" \
                        -p "$COMPOSE_PROJECT" \
                        -f "$WORKSPACE/docker-compose.ecr.yml" \
                        pull

                    docker compose \
                        --env-file "$APP_DIR/.env" \
                        -p "$COMPOSE_PROJECT" \
                        -f "$WORKSPACE/docker-compose.ecr.yml" \
                        up -d

                    docker compose \
                        --env-file "$APP_DIR/.env" \
                        -p "$COMPOSE_PROJECT" \
                        -f "$WORKSPACE/docker-compose.ecr.yml" \
                        ps
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e

                    echo "Checking API Gateway..."

                    for i in $(seq 1 12)
                    do
                        if curl -fsS http://127.0.0.1:5000/health; then
                            break
                        fi

                        if [ "$i" -eq 12 ]; then
                            echo "API Gateway health check failed"
                            exit 1
                        fi

                        sleep 5
                    done

                    echo "Checking Frontend..."

                    curl -fsS http://127.0.0.1:8081/ > /dev/null

                    echo "Checking Public Website..."

                    curl -fsS http://127.0.0.1/ > /dev/null

                    echo "Deployment verification successful"
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Smart Task CI/CD Pipeline Completed!'
        }

        failure {
            echo 'FAILURE: Check Jenkins Console Output'
        }

        always {
            echo 'Pipeline execution finished'
        }
    }
}
