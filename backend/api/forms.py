from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Garment, Category, Outfit, LaundryItem

class GarmentForm(forms.ModelForm):
    """Form for adding/editing garments"""
    
    class Meta:
        model = Garment
        fields = [
            'name', 'description', 'category', 'color', 'size', 
            'brand', 'price', 'image', 'season', 'material', 
            'care_instructions', 'purchase_date'
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter garment name'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Describe this garment...'
            }),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'color': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Navy Blue, Black, etc.'
            }),
            'size': forms.Select(attrs={'class': 'form-select'}),
            'brand': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Brand name'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0'
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
            'season': forms.Select(attrs={'class': 'form-select'}),
            'material': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Cotton, Polyester, etc.'
            }),
            'care_instructions': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Washing and care instructions...'
            }),
            'purchase_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            })
        }

class OutfitForm(forms.ModelForm):
    """Form for creating outfits"""
    
    garments = forms.ModelMultipleChoiceField(
        queryset=Garment.objects.filter(status='clean'),
        widget=forms.CheckboxSelectMultiple,
        required=True
    )
    
    class Meta:
        model = Outfit
        fields = ['name', 'garments', 'occasion', 'season', 'notes', 'weather']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter outfit name'
            }),
            'occasion': forms.Select(attrs={'class': 'form-select'}),
            'season': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Notes about this outfit...'
            }),
            'weather': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Weather conditions'
            })
        }
    
    def __init__(self, user=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            self.fields['garments'].queryset = Garment.objects.filter(
                owner=user, status='clean'
            )

class CategoryForm(forms.ModelForm):
    """Form for adding categories"""
    
    class Meta:
        model = Category
        fields = ['name', 'icon', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Category name'
            }),
            'icon': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'CSS icon class (optional)'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Category description...'
            })
        }

class LaundryForm(forms.ModelForm):
    """Form for adding items to laundry"""
    
    garments = forms.ModelMultipleChoiceField(
        queryset=Garment.objects.filter(status='dirty'),
        widget=forms.CheckboxSelectMultiple,
        required=True
    )
    
    class Meta:
        model = LaundryItem
        fields = ['garments', 'estimated_completion', 'notes']
        widgets = {
            'estimated_completion': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Laundry notes...'
            })
        }
    
    def __init__(self, user=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            self.fields['garments'].queryset = Garment.objects.filter(
                owner=user, status='dirty'
            )

class QuickAddGarmentForm(forms.ModelForm):
    """Simplified form for quick garment entry"""
    
    class Meta:
        model = Garment
        fields = ['name', 'category', 'color', 'size', 'image']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control form-control-sm',
                'placeholder': 'Garment name'
            }),
            'category': forms.Select(attrs={'class': 'form-select form-select-sm'}),
            'color': forms.TextInput(attrs={
                'class': 'form-control form-control-sm',
                'placeholder': 'Color'
            }),
            'size': forms.Select(attrs={'class': 'form-select form-select-sm'}),
            'image': forms.FileInput(attrs={
                'class': 'form-control form-control-sm',
                'accept': 'image/*'
            })
        }

class SearchForm(forms.Form):
    """Search form for garments and outfits"""
    
    query = forms.CharField(
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Search garments, colors, brands...'
        })
    )
    
    category = forms.ModelChoiceField(
        queryset=Category.objects.all(),
        required=False,
        empty_label="All Categories",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    size = forms.ChoiceField(
        choices=[('', 'All Sizes')] + Garment.SIZE_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    season = forms.ChoiceField(
        choices=[('', 'All Seasons')] + Garment.SEASON_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    status = forms.ChoiceField(
        choices=[('', 'All Status')] + Garment.STATUS_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

class CustomUserCreationForm(UserCreationForm):
    """Custom user registration form"""
    
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control'})
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        if commit:
            user.save()
        return user