class Credentials:
    username = 'admin'
    password = 'YcreakPasswd26!'
    host = 'localhost'
    port = '5984'

    @classmethod
    def generate_server_url(self):
        #TODO: shouldn't this be HTTPS?
        return 'http://{0}:{1}@{2}:{3}/'.format(self.username, self.password, self.host, self.port)
