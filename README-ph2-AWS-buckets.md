# Active Storage / AWS Demo, Phase 2: AWS Users And Buckets

Buckets are where Amazon actually stores your files. You will create two
buckets, one for development (`<your-app-name>-dev`) and one for production
(`<your-app-name>-prod`). (You might also find it helpful to have a third bucket
for seeding purposes: `<your-app-name>-seeds`. See the "Storing Seed Files on
AWS S3" reading for information on how to set up that bucket.)

To create a bucket, navigate to the [S3 console]. (If prompted, sign in as `Root
user`.) Click on `Create bucket`. Enter the name--`<your-app-name>-dev`--and
choose the region geographically closest to you. Leave all other options as the
default and click the `Create bucket` button at the bottom of the page. Repeat
to create your `prod` bucket.

You now have space set aside on AWS, but you don't yet have permission to access
it. AWS controls permissions primarily through _policies_. (You can also use
_Access Control Lists_--known as ACLs--to regulate permissions, but Amazon now
discourages the use of ACLs in most cases.) For a good overview of policies and
what they entail, see [here][policies].

For S3, you can create _bucket policies_ and/or _user policies_. The reading for
setting up your seeds bucket configures a bucket policy to make everything in
the `-seeds` bucket public. For your `-dev` and `-prod` buckets, you will
instead use user policies to grant permissions to specific users that you create
for the purpose of interacting with your app.

Note that you can combine bucket and user policies. If, for instance, you
created a __seeds__ folder inside your `-dev` bucket, you could use a bucket
policy to make everything in the __seeds__ folder public while using user
policies to enable your app--and your app alone--to read and write elsewhere in
the bucket. Ultimately, how you choose to configure your permissions is up to
you.

As noted above, you will use user policies to set the permissions for your
`-dev` and `-prod` buckets. First, however, you need to create a new [Identity
and Access Management (IAM)][IAM] user.  An IAM user is a user that you create
within your account, a sort of subset of your main account. Unlike a full root
user, an IAM user will have limited access and permissions within the account.
You define those permissions through user policies. (It is generally a good idea
to create a new IAM user for each app.)

> **Note:** For an IAM user to access buckets owned by a **different** root
> owner, there must be **both** a user policy and a bucket policy in place
> granting permission. As long as you own both the bucket and the IAM user,
> however, one policy will suffice.

To create a new user, head to the [IAM users console][iam-users]. Name the user
`<your-app-name>-admin` or something similar. Select `Access key - Programmatic
access` as the AWS credential type and proceed to `Next: Permissions`.

Now you need to set the security policy for your new user, which controls how
they will be allowed to connect. Click `Attach existing policies directly` and
then `Create Policy`. This will open a new tab.

In the new browser tab, click the `JSON` tab and paste the following:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccess",
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": [
        "arn:aws:s3:::<BUCKET-NAME-DEV>/*",
        "arn:aws:s3:::<BUCKET-NAME-PROD>/*"
      ]
    }
  ]
}
```

Make sure to replace `<BUCKET-NAME-*>` with the appropriate bucket names, e.g.,
`active-storage-demo-dev` and `active-storage-demo-prod`. **These bucket names
must exactly match the names of the buckets you created earlier.**

The JSON object first tells AWS that the policy uses the `2012-10-17` version
policy syntax (i.e., the current version; it hasn't been updated in a while...).
The policy itself consists of a single `Statement` object. The `Statement`
begins with an optional statement id (`Sid`) that can be (almost) anything you
want. The following three key-value pairs then effectively `Allow`--not
`Deny`--all actions (`"Action": ["s3:*"]`) in the listed buckets (`"Resource":
["arn:aws:s3:::<BUCKET-NAME-DEV>/*", "arn:aws:s3:::<BUCKET-NAME-PROD>/*"]`).

When you have entered your policy, click `Next: Tags` and then `Next: Review`.
Give the policy whatever name you like (e.g., `s3-access-to-<name-of-project>`).
After you save and create the policy, head back to the other tab where you are
creating a new IAM user.

Click the refresh button all the way to the right of the `Create Policy` button,
then search for the policy that you just created. Check that policy then head to
the next phase. You can skip additional tags. Create the user.

After you create the user, you will see a page with the new user's `Access Key
ID` and `Secret Access Key`. These are the user's security credentials, and they
will never be accessible again once you leave this page. (If you do leave the
page before securing the credentials, you will need to delete the user and
create a new one.)

Click to download the __.csv__ file. Store this somewhere safe on your computer.
**NEVER PUSH THIS FILE (OR ITS CONTENTS) TO GITHUB OR POST IT ANYWHERE PUBLIC!**

That's it! AWS should now be configured. Now you just have to convince Active
Storage to use it!

[policies]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
[S3 console]: https://s3.console.aws.amazon.com/s3/home?region=us-east-1
[IAM]: https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html
[iam-users]: https://console.aws.amazon.com/iam/home?#/users