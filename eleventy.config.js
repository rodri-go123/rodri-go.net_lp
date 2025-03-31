import * as sass from 'sass';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export default function (eleventyConfig) {
	eleventyConfig.addWatchTarget("./public/*.scss");
  	eleventyConfig.addPassthroughCopy("bundle.js");
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

	  // Execute the shell script that calculates the total size and page sizes
	//   eleventyConfig.on('eleventy.before', () => {
	// 	try {
	// 	  // Run the shell script to calculate site sizes
	// 	  execSync('./calculate-site-sizes.sh', { stdio: 'inherit' }); // display output in terminal
	// 	  console.log('Site size calculations complete.');
	// 	} catch (error) {
	// 	  console.error('Error calculating site sizes:', error);
	// 	}
	//   });
};


