const fs = require("fs");
const readline = require("readline");
const smmry = require("smmry")({
  SM_API_KEY: "AB9D0C21AC",
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

const filePath = "data/blog-posts.json";

if (!fs.existsSync(filePath)) {
  // File does not exist, create it
  fs.writeFile(filePath, "[]", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Blog post file created!");
    }
  });
}

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

function generateSlug(title) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

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

module.exports = {
  writeBlogPostToFile,
};
