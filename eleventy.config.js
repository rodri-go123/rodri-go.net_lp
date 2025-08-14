import * as sass from 'sass';

export default function (eleventyConfig) {
	eleventyConfig.addWatchTarget("./public/*.scss");
  	// eleventyConfig.addPassthroughCopy("bundle.js");
	eleventyConfig.addTemplateFormats("scss");

	// Creates the extension for use
	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css", // optional, default: "html"

		// `compile` is called once per .scss file in the input directory
		compile: async function (inputContent) {
			let result = sass.compileString(inputContent);

			// This is the render function, `data` is the full data cascade
			return async (data) => {
				return result.css;
			};
		},
	});

	// Using compressed images
	eleventyConfig.addPassthroughCopy({
		"projects/**/assets/_processed": "projects"
	  });
	
	return {
	dir: {
		input: ".", // This ensures all files in the root directory are processed
		output: "_site",
		includes: "_includes", // Make sure this matches your actual includes folder
	}
    };

};


