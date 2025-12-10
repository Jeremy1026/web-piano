Rails.application.routes.draw do
  root "piano#index"

  resources :recordings, only: [:create]
  get "/play/:id", to: "play#show", as: :play
end
