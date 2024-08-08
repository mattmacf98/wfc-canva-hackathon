const environment = window.location.hostname === '127.0.0.1' ? 'development' : 'production'
const ENV_TO_BACKEND_HOST = {
    "production": "https://canva-hackathon-backend-33cb89cc3ea5.herokuapp.com",
    "development": "http://127.0.0.1:3001"
}
export const backendHost = ENV_TO_BACKEND_HOST[environment]
