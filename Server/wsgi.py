from server import app

context = ('/etc/letsencrypt/live/oscc.nolden.biz/cert.pem', '/etc/letsencrypt/live/oscc.nolden.biz/privkey.pem')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5004, context=context)

