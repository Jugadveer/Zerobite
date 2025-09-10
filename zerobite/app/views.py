from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from .models import CustomUser

def home(request):
    return render(request, "landing.html")
def signup_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        phone = request.POST.get("phone")
        password1 = request.POST.get("password1")
        password2 = request.POST.get("password2")

        # validations
        if password1 != password2:
            messages.error(request, "Passwords do not match.")
            return redirect("home")

        if CustomUser.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            return redirect("home")

        if CustomUser.objects.filter(email=email).exists():
            messages.error(request, "Email already registered.")
            return redirect("home")

        # create user
        user = CustomUser.objects.create(
            username=username,
            email=email,
            phone=phone,
            password=make_password(password1),  # hash password
        )

        login(request, user)  # auto login after signup
        messages.success(request, f"Welcome {username}, your account has been created!")
        return redirect("donation")   # ✅ redirect to donation instead of dashboard

    return redirect("home")


def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("donation")
        else:
            messages.error(request, "Invalid username or password.")
            return redirect("home")
    print("login done")
    return redirect("home")

@login_required
def donation(request):
    return render(request, "donation.html")
