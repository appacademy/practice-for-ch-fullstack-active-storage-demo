# Active Storage / AWS Demo, Phase 3: Handling Keys And Credentials

Now you want to store your AWS credentials securely within your Rails app. This
means adding them to your __config/credentials.yml.enc__. This file is
encoded--that's what the __.enc__ at the end signifies--which means that you
can't just open the credentials file for editing in VS Code. Instead, you have
to open it with a Rails command: `rails credentials:edit`.

> **Note:** Rails will open the credentials file for editing using your shell's
> default editor. If the default editor is not VS Code (and you would like it to
> be), add

  ```sh
  export EDITOR="code --wait"
  ```

> to your __.bashrc__ or __.zshrc__.

When you open the credentials file of a new Rails app, you should see the
following skeleton commented out at the top:

```yml
# aws:
#   access_key_id: 123
#   secret_access_key: 345
```

Uncomment this code, which sets up `access_key_id` and `secret_access_key` keys
inside an `aws` namespace. Replace the `123` and `345` with the respective
values from your downloaded __.csv__ file. (Remember to wrap the values in
quotation marks since they are strings!) Continuing inside the `aws` namespace,
also add

* a `region` key with a string value of your region
* a `dev` key whose value is itself a key-value pair with a key of `bucket` and
  a value that is the name of your `dev` bucket
* a `prod` key whose value is itself a key-value pair with a key of `bucket` and
  a value that is the name of your `prod` bucket

When you finish, your credentials file should look like this:

```yml
aws:
  access_key_id: "XXXX"
  secret_access_key: "XXXX"
  region: "us-east-1"
  dev:
    bucket: "<BUCKET-NAME>-dev"
  prod:
    bucket: "<BUCKET-NAME>-prod"

# Used as the base secret for all MessageVerifiers in Rails, including the one protecting cookies.
secret_key_base: XXXXXX
```

Double check your `s3_region` [here][aws-regions] (scroll down to **API
Gateways**).

Close the credentials file to have Rails re-encode it.

> **Note:** Rails uses __config/master.key__ to encode your credentials file.
> **NEVER PUSH YOUR MASTER KEY TO GITHUB!** (It should be included in your
> __.gitignore__ by default, but always make sure.)

(If you don't have the correct master key--e.g., for a repo you've cloned from
GitHub--and want to reset your credentials file, delete __config/master.key__
and __config/credentials.yml.enc__. To create new versions of the files, simply
run `rails credentials:edit`. Note, though, that **you will lose whatever
credentials were stored in the original __credentials.yml.enc__.**)

Next, add your services to __config/storage.yml__:

```yml
amazon_dev:
  service: S3
  access_key_id: <%= Rails.application.credentials.aws[:access_key_id] %>
  secret_access_key:
    <%= Rails.application.credentials.aws[:secret_access_key] %>
  region: <%= Rails.application.credentials.aws[:region] %>
  bucket: <%= Rails.application.credentials.aws[:dev][:bucket] %>

amazon_prod:
  service: S3
  access_key_id: <%= Rails.application.credentials.aws[:access_key_id] %>
  secret_access_key:
    <%= Rails.application.credentials.aws[:secret_access_key] %>
  region: <%= Rails.application.credentials.aws[:region] %>
  bucket: <%= Rails.application.credentials.aws[:prod][:bucket] %>
```

Finally, specify which storage service should be used in each environment, i.e.,
in __config/environments/development.rb__ and
__config/environments/production.rb__ change the `config.active_storage.service
= :local` line to the following, respectively:

```ruby
# config/environments/development.rb

config.active_storage.service = :amazon_dev
```

```ruby
# config/environments/production.rb

config.active_storage.service = :amazon_prod
```

You did it! You should now be able to attach files through the console, which
you will test in the next phase.

[aws-regions]: http://docs.aws.amazon.com/general/latest/gr/rande.html