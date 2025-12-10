Rails.application.routes.draw do
  root "piano#index"

  resources :recordings, only: [:create]
  get "/play/:token", to: "play#show", as: :play
end
