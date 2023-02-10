# Interlude: Getting The Correct URL

This project has instructed you to retrieve the URLs of your images by using
`.url` on the blobs, e.g., `@post.photo.url`. You could also have retrieved them
by using the common `url_for` helper: `url_for(@post.photo)`. While either
approach should work in the context of the current project, they are not always
so interchangeable. In fact, the two methods behave very differently. This
reading will help you understand the significant differences between the two
methods so that you will know which is the more appropriate for any given
context.

## Seeing the difference

First, let's see what each method actually returns. Open
__app/views/posts/show.html.erb__ and insert a `debugger` at the top:

```erb
# app/views/posts/show.html.erb

<% debugger %>
<h1><%= @post.title %></h1>
<img src="<%= @post.photo.url %>" alt="">
```

Boot up your server if it is not already running (`rails s`) and go to
`http://localhost:3000/posts/1`. (This demonstration assumes that you have
completed Phase 4 and attached a photo on AWS to Post 1!)

When the debugger stops the execution of your code, check the value of
`@post.photo.url`. After a couple queries to the database, it should ultimately
produce a URL that looks like this:

```plaintext
https://<your-bucket-name>.s3.amazonaws.com/<filename-on-aws>?<long-query-string>
```

Next, check the value of `url_for(@post.photo)`. It should immediately produce a
URL that looks like this:

```plaintext
/rails/active_storage/blobs/redirect/<long-string>/<filename>.jpg
```

These two **VERY** different URLs diverge in two significant ways.

## Service vs. redirection URLs

First, `.url` produces what is called a _service URL_ because the URL links
directly to the endpoint service, here, AWS. `url_for`, in contrast, produces a
_redirection URL_ that links to some internal Rails endpoint that will then
redirect the request behind the scenes to the desired AWS endpoint. As the Rails
[docs][redirect-mode] note, this decoupling of the URL that gets called from the
actual service URL enables Rails to, for instance, increase availability of an
attachment by storing it with multiple services. High availability of
attachments is probably not something you need to worry about in your current
projects, but it is a concept worth filing away for later.

[redirect-mode]: https://guides.rubyonrails.org/active_storage_overview.html#redirect-mode

## Absolute vs. relative URLs

The second major difference is that `.url` returns an absolute URL whereas
`url_for` returns a relative URL. You can plug an absolute URL into any browser
and the browser will know where to go. A relative URL is much less robust: it
will only find its destination if followed on the same host that produced it. If
Rails is serving up your views so that the frontend and backend are running on
the same host, relative URLs will process much faster. If a Rails backend is
serving as an API sending URLs to different sites, however, relative URLs will
break and become useless.

What if you want the redirection capabilities of `url_for` but need an absolute
URL to send off-site? In that case you can use `polymorphic_url(@post.photo)`.
Go ahead and try it! (You still have your debugging session open, right?) You'll
get back a URL with the following form:

```plaintext
http://localhost:3000/rails/active_storage/blobs/redirect/<long-string>/<filename>.jpg
```

Copy and paste the URL into your browser to confirm that it will work.

Ok, back to coding!