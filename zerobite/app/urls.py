from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('', views.home, name='home'),
    path("signup/", views.signup_view, name="signup"),
    path("login/", views.login_view, name="login"),
    path("donation/", views.donation, name="donation"),
    path("logout/", LogoutView.as_view(), name="logout"),
]