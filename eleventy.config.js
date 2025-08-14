import * as sass from 'sass';
import fs from 'fs';
import path from 'path';

// add some extra fluff to the markdown
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";



export default function (eleventyConfig) {
	eleventyConfig.addWatchTarget("./public/*.scss");
	eleventyConfig.addTemplateFormats("scss");

	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",
		compile: async function (inputContent) {
			let result = sass.compileString(inputContent);
			return async () => result.css;
		},
	});

	// custom mardown parsing
	eleventyConfig.setLibrary(
		"md",
		markdownIt({ html: true })
		.use(markdownItAttrs)
		.use(function(md) {
			const defaultRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
			return self.renderToken(tokens, idx, options);
			};
			
			// image parsing
			md.renderer.rules.image = function(tokens, idx, options, env, self) {
			let token = tokens[idx];
			let srcIndex = token.attrIndex("src");

			if (srcIndex >= 0) {
				let src = token.attrs[srcIndex][1];

				// add assets/ if no folder is present
				if (!src.includes("/") && !src.startsWith("assets/")) {
				src = "assets/" + src;
				}

				// convert extension to .webp if needed
				if (!src.toLowerCase().endsWith(".webp")) {
				src = src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
				}

				token.attrs[srcIndex][1] = src;
			}

			return defaultRender(tokens, idx, options, env, self);
			};
		})
	);

	// Use compressed images in projects
	eleventyConfig.addPassthroughCopy({
		"projects/**/assets/_processed": "projects"
	});

	// After build: move compressed images up one level and remove originals
	eleventyConfig.on("afterBuild", () => {
		const projectsDir = "_site/projects";

		const walkSync = (dir) => {
			fs.readdirSync(dir).forEach((file) => {
				const fullPath = path.join(dir, file);
				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					if (file === "_processed") {
						// Move each compressed file to the parent "assets" folder
						const parentDir = path.dirname(fullPath);
						fs.readdirSync(fullPath).forEach((imgFile) => {
							const srcPath = path.join(fullPath, imgFile);
							const destPath = path.join(parentDir, imgFile);
							fs.renameSync(srcPath, destPath);
						});
						// Remove the now-empty _processed folder
						fs.rmdirSync(fullPath);
					} else {
						walkSync(fullPath);
					}
				}
			});
		};

		// Remove original JPG/PNG images after moving compressed ones
		const removeOriginals = (dir) => {
			fs.readdirSync(dir).forEach((file) => {
				const fullPath = path.join(dir, file);
				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					removeOriginals(fullPath);
				} else if (/\.(jpe?g|png)$/i.test(file)) {
					fs.unlinkSync(fullPath);
				}
			});
		};

		if (fs.existsSync(projectsDir)) {
			walkSync(projectsDir);
			removeOriginals(projectsDir);
		}
	});

	return {
		dir: {
			input: ".",
			output: "_site",
			includes: "_includes",
		}
	};
}
