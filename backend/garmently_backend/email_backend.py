import socket
from django.core.mail.backends.smtp import EmailBackend

class EmailBackendIPv4(EmailBackend):
    """
    Custom EmailBackend that forces IPv4 resolution.
    This is useful for environments like Railway/Docker where IPv6 might be flaky.
    """
    def open(self):
        # If we already have a connection, do nothing
        if self.connection:
            return False

        # Monkey-patch socket.getaddrinfo to force IPv4
        original_getaddrinfo = socket.getaddrinfo

        def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
            # Force AF_INET (IPv4) if family is unspecified or AF_UNSPEC
            if family == 0 or family == socket.AF_UNSPEC:
                family = socket.AF_INET
            return original_getaddrinfo(host, port, family, type, proto, flags)

        try:
            socket.getaddrinfo = ipv4_getaddrinfo
            return super().open()
        finally:
            # Restore the original getaddrinfo
            socket.getaddrinfo = original_getaddrinfo
