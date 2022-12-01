# Using AWS S3 For Static Storage

A guide to set up Amazon Web Services' Simple Storage Service (AWS S3) to house
static content--images, videos, music files, etc.--needed by your app, including
for seeding purposes.

**Note:** This reading does **NOT** cover how to configure AWS to store objects
uploaded by users.

## Why?

Why would you want to use an AWS S3 bucket for static content? While Render's or
Heroku's PostgreSQL database is good for storing most of your data in an
organized format, it's not optimized for storing large files like images, music,
or video files that you might want to use in your application. AWS's S3 is an
object storage service which allows you to store images, music files, or any
other kind of large file that PostgreSQL wouldn't be able to store well. Using
AWS or some other content delivery network (CDN) will allow you to use larger
files without impacting your application's performance in a negative way.

## Create your AWS S3 bucket

Navigate to the [AWS Console], create an account if you haven't used AWS yet, or
log in if you have. Once you are logged in there, you should arrive at the
Amazon S3 Buckets page.

![aws-s3-buckets-page]

Click on the orange "Create bucket" button, enter a name--e.g.,
`<your-app-name>-seeds`--choose the region nearest you, and leave all other
options as default. **UNCHECK** the checkbox that says "**Block *all* public
access**". (You'll also need to **check** the checkbox that then appears
acknowledging that the "current settings might result in this bucket and the
objects within becoming public.")

Scroll to the bottom and click "Create bucket". You might run into an error
where the name is already taken, so be sure to choose a unique name. If your
bucket was created successfully, then you'll be taken back to the Amazon S3
Buckets page.

## Setting a bucket policy

The next thing you need to do is set a bucket policy to control access to the
objects in your bucket. Click on the bucket you just made. On the ensuing page,
go to the "Permissions" tab.

![aws-s3-bucket-permissions]

Scroll down to the "Bucket policy" section and click "Edit". Copy and paste the
following into the "Policy" editor:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::{YOUR-BUCKET-NAME}/*"
      ]
    }
  ]
}
```

(Don't forget to replace `{YOUR-BUCKET-NAME}` with the actual name of your
bucket!)

This policy effectively makes everything in your bucket publicly accessible. The
various key-value pairs have the following significance.

The JSON object first tells AWS that the policy uses the `2012-10-17` version
policy syntax (i.e., the current version; it hasn't been updated in a while...).
The policy itself consists of a single `Statement`. The `Statement` begins with
an optional statement id (`Sid`) that can be (almost) anything you want. The
following four key-value pairs then effectively `Allow`--not `Deny`--anyone
(`"Principal": "*"`) to get the objects (`"Action": [s3:GetObject]`) in this
bucket (`"Resource": ["arn:aws:s3:::{YOUR-BUCKET-NAME}/*"]`).

(If you need more nuanced permissions, you can adjust the key-value pairs and/or
include more `Statement`s. For example, if you only want the items in a
__seeds__ directory to be publicly accessible, then you could change the
resource to `"Resource": ["arn:aws:s3:::{YOUR-BUCKET-NAME}/seeds/*"]`. For a
good overview of policies and what they entail, see [here][policies]. Examples
of bucket policies can be found [here][bucket-policy-examples].)

Click the "Save changes" button at the bottom right. If everything is correct,
you should return to your bucket page with a "Successfully edited bucket
policy." message at the top. You should now see a red bubble under your bucket
name proclaiming "Publicly accessible". The "Access" under the "Permission
overview" should also now show "Public" in red as opposed to the "Objects can be
public" message that was there before.

![aws-s3-bucket-policy-success]

## Adding images

Select the bucket that you just made. On the next page, click either of the
"**Upload**" buttons to go to a page where you can upload files and/or folders
to your bucket.

![aws-s3-bucket-before-upload]

On this next page, use the "**Add files**" button, "**Add folder**" button, or
drag and drop your files to start the upload process.

![aws-s3-upload]

When your file list is correct, click the "Upload" button at the bottom of the
page. You should arrive at an upload status page. (It might take a few seconds
before your files finish uploading.) Once the files have been successfully
uploaded, click on the "Close" button in the upper right-hand corner.

![aws-s3-upload-status]

You should now be back on your bucket's page. It should show the items that were
just uploaded.

![aws-s3-bucket-after-upload]

## Getting the URL to use

From your bucket page, click on the resource you want the URL for. This will
direct you to the details page for this one object in your bucket. If you
correctly set the bucket policy to public above, then you should be able to
click on the blue URL under the "Object URL" label and view the resource. You
can take that same URL and use it in your seeder files or wherever else you need
this resource.

![aws-s3-object-detail]

If your bucket policy has not been set up correctly, then clicking on the link
will result in an "Access Denied" response.

![access-denied]

## Accessing your content

To access the bucket's content from your Rails app, you will need the "Object
URL" that appears in blue on the object's resource page in AWS. Note that, since
AWS uses the original filenames for files uploaded in the manner described
above, the resulting URLs are usually rather straightforward and easy to
construct.

To open the URL and retrieve the content, first `require "open-uri"` at the top
of the file, then pass the URL to `URI.open`. (`URI.open` is part of the
standard Ruby library, so although you need to `require "open-uri"` to load the
package in any file that uses it, you do not need to add a new gem for it in
your __Gemfile__.)

**Note:** Rails loads `open-uri` as part of its command line processing, so you
can usually get away with not requiring the package at the top of your
__seeds.rb__ file. Nevertheless, it is still better to include it so that your
code does not depend on an underlying Rails implementation that could change.
You will also need to `require "open-uri"` at your Rails console prompt before
you can call `URI.open` inside the console.

To see what this might look like in your seed file, think back to your Bench BnB
project. How could you seed three benches with photos attached? You would first
create a `benchbnb-seeds` bucket, set up the bucket policy to allow public
access, and then upload three images to the bucket with the names
__bench_1.jpg__, __bench_2.jpg__, and __bench_3.jpg__. You could then attach the
photos in your seed file as follows:

```rb
# db/seeds.rb

require "open-uri"

# Create User and Bench seeds...

# Attach bench photos
Bench.first(3).each_with_index do |bench, index|
  bench.photo.attach(
    # The string passed to URI.open should be the URL of the image in its bucket.
    # This sample assumes the bucket name is `benchbnb-seeds`.
    io: URI.open("https://benchbnb-seeds.s3.amazonaws.com/bench_#{index + 1}.jpg"), 
    filename: "bench_#{index + 1}.jpg"
  )
end
```

> **Note:** You may sometimes see older code that uses `open` instead of
> `URI.open`. As of Ruby 3.0, `open-uri` no longer overwrites the global
> `Kernel#open`, so `open` will no longer work.

Of course, in this case, you will likely want your app to store these
photos--and any photos that users upload when creating `Bench` instances--in a
way that permanently  associates them with their respective benches. For that,
you will want to set up an AWS bucket equipped for your app to upload resources.
(See the "Active Storage Demo" __README.md__.)

A few notes on seeding to keep in mind:

1. Anyone can make GET requests to retrieve your publicly available resources on
   S3. This is probably not something you need to worry about, but if you want
   some added security, you could change your bucket policy to `Deny` such
   requests instead of `Allow`ing them after you have seeded your app. Just make
   sure that you do not remove access to any resources that your app might need
   when **running** (i.e., not seeds). Remember, too, that you will need to
   change your policy back to `Allow` any time you want to seed your app.

   > **Note:** Removing your bucket policy entirely will instantly make your
   > bucket private.

2. Because you are only using the public interface/URL to access your resources,
   Rails and Active Storage don't need to know it exists. In other words, you
   don't need to worry about changing any configuration files. Yeah!

3. At the time of this writing, the AWS free tier gives you 5 GB of storage,
   20,000 `GET` requests, 2,000 `PUT` requests, and 100 GB of data transfer each
   month for one year. Every time you run your seed file, you're potentially
   making a lot of `GET` requests, which can cause you to exceed your limit and
   start costing you money. This is especially true if you're working with large
   files like videos. If you know you're going to be seeding your app
   frequently, try to limit the size of your seed file in development--include
   just enough to demonstrate your MVP appropriately--and save larger seedings
   for production.

4. Finally, if you are seeding from AWS, **don't wrap your seed code in an
   `ApplicationRecord.transaction`** as this can create problems in your bucket
   if the transaction has to be reversed.

[AWS Console]: https://s3.console.aws.amazon.com/s3/home
[aws-s3-buckets-page]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-buckets-page.png
[aws-s3-bucket-permissions]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-bucket-permissions.png
[aws-s3-bucket-policy-success]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-bucket-policy-success.png
[aws-s3-bucket-before-upload]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-bucket-before-upload.png
[aws-s3-upload]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-upload.png
[aws-s3-upload-status]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-upload-status.png
[aws-s3-bucket-after-upload]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-bucket-after-upload.png
[aws-s3-object-detail]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-object-detail.png
[access-denied]: https://appacademy-open-assets.s3.us-west-1.amazonaws.com/Modular-Curriculum/content/week-16/aws-s3-access-denied.png
[policies]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
[bucket-policy-examples]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html