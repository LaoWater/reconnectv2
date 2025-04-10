from django.urls import path, include
from django.views.generic import TemplateView
from . import views  # Current Directory

urlpatterns = [
    # When someone visits the default route, run index function that is one of my views
    path("", views.index, name="index"),

    path("en/", views.index_en, name="index_en"),

    path("coming_soon/", views.coming_soon, name="coming_soon"),

    path("contact/", views.contact, name="contact"),

    path('bibliography/', views.bibliography, name='bibliography'),

    path('send-email/', views.send_email, name='send_email'),  # form submission

    path('submit-newsletter', views.submit_newsletter, name='submit_newsletter'),

    path('ylf/', views.ylf_response, name='ylf_response'),

    path('food-prophet/', views.react_food_prophet, name='react_food_prophet'),

    path('accounts/', include('allauth.urls')),  # Includes allauth URLs

    path('save-conversations/', views.save_conversation_history, name='save_conversation_history'),

    path('get-user-data/', views.get_user_data, name='get_user_data'),

    path('ajax/login/', views.ajax_login, name='ajax_login'),

    path('ajax/register/', views.ajax_register, name='ajax_register'),

    path('ajax/logout/', views.ajax_logout, name='ajax_logout'),

    path('ajax/check-login/', views.check_login_status, name='check_login_status'),

    # Exporting sqlLite3 database from Deployment (GC) to Local for syncinc.
    path('export-database/', views.export_database, name='export_database'),

    path('log-scroll/', views.log_scroll, name='log_scroll'),

    path("add-to-cart/", views.add_to_cart_server_event, name="add_to_cart"),

    path('store-feedback/', views.store_feedback, name='store_feedback'),

    path('submit-rlhf-feedback/', views.submit_rlhf_feedback, name='submit_rlhf_feedback'),

    path('empty-close/', TemplateView.as_view(template_name='landing_page/util/empty_close.html'), name='empty-close'),

]


