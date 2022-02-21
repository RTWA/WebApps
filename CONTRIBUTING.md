WebApps is open source software which means all of our source code is available for you to view, scrutinise, correct and submit!
We are open to Pull Requests for our software or our documentation.

### Developing WebApps
**New to Contributing?**
We all have to start somewhere! If you're a little confused on how to get started, be sure to check out [How to contribute to Open Source](https://opensource.guide/how-to-contribute/) for an overview of good habits, and the [GitHub documentation on how to create a Pull Request](https://help.github.com/articles/creating-a-pull-request/) for the technical information!

Please make sure you submit all Pull Requests into the [`RTWA\WebApps`](https://github.com/RTWA/WebApps) repository, using the `develop` branch.<br />
Any Pull Requests to update our documentation should be made into the [`RTWA\WebApps-Documentation`](https://github.com/RTWA/WebApps-Documentation) repository, using the `develop` branch.

_**Note:** new Plugins and Apps should not be submitted via a Pull Request. Please see [Submitting an App](./app-development/submit.md) or [Submitting a Plugin](#) for more details._

As you are working on bug-fixes or new features, please break them out into their own branch and open the Pull Request against your branch. It makes it easier for us to approve Pull Requests quickly.

If you don't have a feature in mind, but would like to contribute back to the project, check out the open issues and see if there are any that you feel you can tackle.

If you have a feature in mind that hasn't been asked for in Github Issues, please open an issue so that we can discuss how it should work so that it will benefit the entire community.

### Tools you'll need
In order to contribute to WebApps you'll need access to a few tools.
- Git
- Composer
- Node.js (npm)
- A decent text editor (we use [VSCode](https://code.visualstudio.com/))

### Setting up your development installation
First you'll need to clone the `develop` branch of our repository and setup your Web Server environment, or use Laravel's `php artisan serve`.

You'll need to install Composer dependencies via `composer install` and then install Node/NPM dependencies via `npm install`.

You can then either run through the normal WebApps web-based installation, or you can skip this by using the WebApps [Developer Commands](developer-commands).

### Enable Developer Mode
You can add/change the following in your `.env` file to aid development.
```env title=".env"
APP_ENV=local
APP_DEBUG=true
```

### Code Comments
WebApps uses phpDocumentor style docblocks. An example of the format that comment blocks should use is below. All new functions should be commented and any changes made to a function should be present within the exisiting comment.

```PHP
/**
* A summary informing the user what the associated element does.
*
* A *description*, that can span multiple lines, to go _in-depth_ into the details of this element
* and to provide some background information or textual references.
*
* @param string $myArgument With a *description* of this argument, these may also
*    span multiple lines.
*
* @return void
*/
```

For more information, check out the [phpDocumentor documentation](https://docs.phpdoc.org/).<br />
If the function you are creating uses [Type-Hinting](https://laravel.com/docs/8.x/artisan#type-hinting-dependencies), then you do not need to specify the parameter and return types.

### Testing
No Pull Request will be accepted if the code does not include and pass tests.

We use PHPUnit, as included with Laravel for testing PHP code. You can test the code yourself by running `php artisan test`.<br />
We also test PHP code to be compliant with the PSR2 coding standard. You can test the code yourself by running `vendor/bin/phpcs`.

Our Javascript Components are tested using Jest and Testing Library. You can test the code yourself by running `npm run test`.

### Start Contributing!
Once you have your development environment setup you can start to contribubte to WebApps!

WebApps is built using the Laravel PHP Framework and Tailwind CSS and React for the front end.<br />
Several pre-built [React Components](/developers/react-components/index) are provided for developers to utilise.

Ensure you have familiarised yourself with the [directory structure](directory-structure) that WebApps uses.