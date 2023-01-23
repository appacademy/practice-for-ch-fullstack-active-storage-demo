# Active Storage / AWS Demo

In this demo, you will configure a basic Rails-React app to use the Amazon Web
Services (AWS) S3 service to store user uploads (avatars, images, files, etc.).

You can find the solution code for this demo at the `Download Project` button at
the bottom of this page. Note, though, that since __master.key__ is **NEVER**
pushed to GitHub, you will need to set up new credentials (and AWS buckets) for
the app to run (see Phase 3).

## Phase 0a: Sign up for an AWS account

To use the S3 cloud storage service, you will need to create an AWS account,
which you can do [here][aws-signup]. Select the free tier when asked.

You will be asked for a credit card, but you will not be charged right away. It
has happened, however, that students were charged because they exceeded the data
limits of the [free tier]. Take a minute to read up on [S3 pricing]. There are
two ways in which students have accidentally exceeded the data limits:

1. Their seed file contained too many images or videos, and they seeded their
   database too many times.
2. They had an index page with lots of `video` tags that loaded a lot of large
   video files on every refresh.

If you're worried about exceeding the data limits for the free tier, make sure
to monitor your usage regularly.

[aws-signup]: https://portal.aws.amazon.com/billing/signup#/start/email
[free tier]: https://aws.amazon.com/free/
[S3 pricing]: https://aws.amazon.com/s3/pricing/

## Phase 0b: Set up a basic Rails app

Create a new Rails app--name it something like `active-storage-demo`--without
Unit Tests (`-T`) and with `postgresql` as the db. Do **NOT** use the
`--minimal` flag. If you use the `-G` flag, grab __.gitignore__ and
__.gitattributes__ files from the project solution or a prior project.

Adjust your Gemfile as desired and `bundle install`.

Create a simple `Post` model. It should have a string `title`. Set a database
constraint and model validation to ensure that `title` is present. Create and
migrate your database.

Good enough! You're ready to go!

## Phase 1: Set up Active Storage

The Rails package that enables you to handle attachments and blob tables is
called Active Storage. To set up Active Storage, do the following:

* Add `gem "aws-sdk-s3"` to your Gemfile and `bundle install`.

* Run `rails active_storage:install`. This will create a migration to set up
  tables for attachments, blobs, and variant records. Don't worry about the
  details of these tables; you won't need to know them.

  > **Note:** If you want to install Active Storage on a Rails app created with
  > the `--minimal` flag, you first need to uncomment the following two lines at
  > the top of __config/application.rb__:

    ```rb
    require "active_job/railtie"
    # ...
    require "active_storage/engine"
    ```

* Run the migration: `rails db:migrate`.

* Add the attachment association--it works just like a `has_one` association--to
  your desired model:

  ```rb
  # app/models/post.rb

  class Post < ApplicationRecord
    # ...
    has_one_attached :photo
  end
  ```

  **Note:** Rails also provides a `has_many_attached` macro, which you will use
  below.

Head to Phase 2 to configure your AWS users and buckets.