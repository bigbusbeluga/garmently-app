from django.core.management.base import BaseCommand
from api.models import Category


class Command(BaseCommand):
    help = 'Create default categories for Garmently'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Tops', 'icon': 'fa-shirt', 'description': 'Shirts, blouses, and tops'},
            {'name': 'Bottoms', 'icon': 'fa-pants', 'description': 'Pants, jeans, and skirts'},
            {'name': 'Dresses', 'icon': 'fa-dress', 'description': 'Dresses and jumpsuits'},
            {'name': 'Outerwear', 'icon': 'fa-jacket', 'description': 'Jackets, coats, and blazers'},
            {'name': 'Shoes', 'icon': 'fa-shoe-prints', 'description': 'All types of footwear'},
            {'name': 'Accessories', 'icon': 'fa-gems', 'description': 'Bags, jewelry, and accessories'},
        ]

        created_count = 0
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'description': cat_data['description']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category already exists: {category.name}'))

        self.stdout.write(self.style.SUCCESS(f'\nSetup complete! Created {created_count} new categories.'))
