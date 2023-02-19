[Link to blog post](https://www.owolf.com/posts/node-blog-post-creation-script#step-2-set-up-the-smmry-api)

If you're a blogger or content creator, you know how important it is to have a process for generating and publishing high-quality content on a regular basis. One way to streamline this process is to use a command line interface (CLI) tool to generate and save your blog posts in a structured format that can be easily published on your blog.

In this tutorial, we'll be building a CLI tool using Node.js that allows you to generate and save blog posts in a JSON format. We'll be using the Smmry API to generate an excerpt for each blog post, and we'll be using the fs and readline modules to write the data to a file and prompt the user for input.

## Step 1: Set up the project

To get started, create a new directory for your project and navigate to it in your terminal. Then, run the following command to create a new Node.js project:

```bash
npm init -y
```

This will create a new package.json file for your project with default settings.

Next, we'll install the dependencies we'll be using in this project:

The smmry module is a third-party module that allows us to generate an excerpt for each blog post.

```bash
npm install smmry
```

Now create a new file called create-blog.js in your project directory. This is where we'll write our code.

## Step 2: Set up the Smmry API

To use the Smmry API, we'll need to sign up for a free API key at https://smmry.com/partner. Once you have your API key, create a new file called .env in your project directory and add the following line:

```bash
SM_API_KEY=<your API key>
```

This will allow us to access our API key as an environment variable in our Node.js code.

## Step 3: Create a function to generate a blog post

Next, let's create a function called generateBlogPost that takes in an object containing the data for a blog post and returns a JSON string representing the blog post.

```javascript
const smmry = require("smmry")({
  SM_API_KEY: process.env.SM_API_KEY,
  SM_LENGTH: 2,
});

async function generateBlogPost(data) {
  const excerpt = await smmry.summarizeText(data.body);
  const blogPost = {
    title: data.title,
    slug: generateSlug(data.title),
    author: data.author,
    categories: data.categories,
    publishedDate: new Date(data.publishedDate).toISOString(),
    description: data.description,
    excerpt: excerpt.sm_api_content,
    body: data.body,
  };
  return JSON.stringify(blogPost);
}
```

This function first generates an excerpt for the blog post using the Smmry API. It then creates a new object representing the blog post with properties for the title, author, categories, published date, description, excerpt, and body. Finally, it returns a JSON string representing the blog post.

Note that we're using a helper function called generateSlug to generate a URL-friendly slug based on the title of the blog post. We'll define this function in a later step.

## Step 4: Write the blog post to file

After we have generated the blog post object, we can now write it to a JSON file. We do this by calling the writeFile method of the fs module. If the file already exists, we first read its contents and parse it as JSON. We then push the new blog post to the existing array and write the updated data back to the file. If the file does not exist, we create it and initialize it with an empty array.

Here's the writeBlogPostToFile function:

```javascript
function writeBlogPostToFile(data) {
  generateBlogPost(data).then((blogPost) => {
    fs.readFile(filePath, "utf8", (err, fileData) => {
      if (err) {
        console.error(err);
      } else {
        console.log("fileData:", fileData);
        let newData;
        if (fileData) {
          // Parse existing data as JSON and push new blog post to array
          const existingData = JSON.parse(fileData);
          existingData.push(JSON.parse(blogPost));
          newData = JSON.stringify(existingData);
        } else {
          newData = `[${blogPost}]`;
        }
        fs.writeFile(filePath, newData, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Blog post saved to file!");
          }
        });
      }
    });
  });
}
```

## Step 5: Generate a slug

The generateSlug function takes a title string and returns a slug, which is a URL-friendly version of the title. It does this by converting the title to lowercase and replacing spaces with hyphens.

```javascript
function generateSlug(title) {
  return title.toLowerCase().replace(/\s+/g, "-");
}
```

## Step 6: Read user input and call writeBlogPostToFile

To create a new blog post, we prompt the user to enter various fields such as the title, author, categories, and body. We then create an object with these fields and pass it to writeBlogPostToFile.

We use the readline module to read user input from the command line. We create an interface by calling the createInterface method and passing in the process.stdin and process.stdout streams. We then use the question method to prompt the user for input and pass in a callback function to handle the user's response.

Here's the code that reads user input and calls writeBlogPostToFile:

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter blog post title: ", (title) => {
  const data = { title };
  rl.question("Enter blog post author: ", (author) => {
    data.author = author;
    rl.question(
      "Enter blog post categories (comma-separated): ",
      (categories) => {
        data.categories = categories.split(",");
        rl.question(
          "Enter blog post published date (YYYY-MM-DD): ",
          (publishedDate) => {
            data.publishedDate = publishedDate;
            rl.question("Enter blog post description: ", (description) => {
              data.description = description;
              rl.question("Enter blog post body: ", (body) => {
                data.body = body;
                writeBlogPostToFile(data);
                rl.close();
              });
            });
          }
        );
      }
    );
  });
});
```

## Run the script

Now that you have written all the necessary code, it's time to run the script and create a new blog post. In your terminal, navigate to the directory where you have saved the script file and run the following command:

```bash
node create-blog.js
```
