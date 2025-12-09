from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        # Check password match
        if attrs['password'] != attrs['confirm_password']:
            raise ValidationError({'password': 'Password fields did not match'})

        # Check if email is already used
        if User.objects.filter(email=attrs['email']).exists():
            raise ValidationError({'email': 'Email is already in use. Please use a new email.'})

        return attrs

    def create(self, validated_data):
        # Remove confirm_password
        validated_data.pop('confirm_password')

        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both fields are required")

        return attrs
