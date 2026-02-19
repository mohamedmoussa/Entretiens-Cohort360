from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Pagination standard de l'API par numéro de page.

    Attributes:
        page_size (int): Taille de page par défaut (20 éléments).
        page_size_query_param (str): Paramètre de requête pour surcharger la taille (``page_size``).
        max_page_size (int): Taille maximale autorisée par page (100 éléments).
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
