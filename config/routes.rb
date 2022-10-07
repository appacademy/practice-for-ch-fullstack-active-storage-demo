Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  resources :posts, only: [:show]
  namespace :api, defaults: {format: :json} do
    resources :posts, only: [:create, :index]
  end
end