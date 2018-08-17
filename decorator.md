# Python Decorators

A decorator is a function that takes another function as a input, and does something with it. Say we have two functions:

```python
def FunctionA():
    print('something')

def FunctionB(someFunction):
    someFunction()
    
FunctionB(FunctionA)
```

Function B is a decorator. Running this would return:

```
something
```

Decorators can be used for many things like monitoring the output of functions or calling a function multiple times

## Pie Syntax

Decorator functions are usually called using Pie syntax. It looks like this:

```python
def FunctionA():
    print('something')
    
@FunctionB
def FunctionA():
    print('something')
```

This is the python way of doing:

```python
FunctionA(FunctionB())
```

## Real Example

### Flask

Flask is a Python application framework. Decorators are used in Flask web controllers to map URLs to the functions they perform. For example:

```python
@app.route('/home')
def home()
    return('You are home')
```

If a user went to the URL **/home** the decorator **app.route()** would execute the function returning "You are home".
