from app import app
from flask import render_template, request
import sys


@app.route('/')
def home():
    return render_template('search.html')


@app.route('/results', methods=['GET', 'POST'])
def search_request():

    return render_template('search.html')
