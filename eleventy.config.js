import * as sass from 'sass';
import fs from 'fs';
import path from 'path';

// add some extra fluff to the markdown
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItImageFigures from "markdown-it-image-figures";
import markdownItFootnotes from 'markdown-it-footnote';


export default function (eleventyConfig) {

	// run local server
	  eleventyConfig.setServerOptions({
		port: 8080,         // or your desired port
		showAllHosts: true  // allow access from local network
	});

	// create collections for filtering

	// sort projects by date, newest fist
	eleventyConfig.addCollection("sortedProjects", (collectionApi) => {
		return collectionApi.getFilteredByTag("project").sort((a, b) => {
		return b.date - a.date;
		});
  	});

	// Projects by category, sorted by date
	eleventyConfig.addCollection("projectsByCategory", (collectionApi) => {
		const map = {};
		collectionApi.getFilteredByTag("project").forEach((project) => {
		(project.data.categories || []).forEach((cat) => {
			if (!map[cat]) map[cat] = [];
			map[cat].push(project);
		});
		});
		for (const cat in map) {
		map[cat].sort((a, b) => b.date - a.date);
		}
		return map;
	});

	// // Projects by year, sorted by date
	// eleventyConfig.addCollection("projectsByYear", (collectionApi) => {
	// 	const map = {};
	// 	collectionApi.getFilteredByTag("project").forEach((project) => {
	// 	const year = project.data.year;
	// 	if (!map[year]) map[year] = [];
	// 	map[year].push(project);
	// 	});
	// 	for (const year in map) {
	// 	map[year].sort((a, b) => b.date - a.date);
	// 	}
	// 	return map;
	// });

	// // All years list, sorted descending
	// eleventyConfig.addCollection("yearsList", (collectionApi) => {
	// 	const years = new Set();
	// 	collectionApi.getFilteredByTag("project").forEach((project) => {
	// 	if (project.data.year) years.add(project.data.year);
	// 	});
	// 	return [...years].sort((a, b) => b - a);
	// });

	// All categories list
	eleventyConfig.addCollection("categoriesList", (collectionApi) => {
		const categories = new Set();
		collectionApi.getFilteredByTag("project").forEach((project) => {
		(project.data.categories || []).forEach((cat) => categories.add(cat));
		});
		return [...categories];
	});


	// compile SCSS files
	eleventyConfig.addWatchTarget("./public/*.scss");
	eleventyConfig.addTemplateFormats("scss");

	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",
		compile: async function (inputContent) {
			let result = sass.compileString(inputContent);
			return async () => result.css;
		},
	});

	// custom njk filters

	// get last segment of a URL
	eleventyConfig.addFilter("lastSegment", (url) => {
		if (!url) return "";
		// strip trailing slash if present
		let cleaned = url.replace(/\/$/, "");
		// split and return the last part
		return cleaned.split("/").pop();
	});

	// custom mardown parsing
	eleventyConfig.setLibrary(
		"md",
		markdownIt({ html: true })
		.use(markdownItAttrs)
		.use(markdownItFootnotes)
		.use(markdownItImageFigures, {
			figcaption: "title",
			copyAttrs: true,
		})

		.use(function (md) {
			const defaultRender =
			md.renderer.rules.image ||
			function (tokens, idx, options, env, self) {
				return self.renderToken(tokens, idx, options);
			};

			// your custom image rendering (assets/ prefix + .webp conversion)
			md.renderer.rules.image = function (tokens, idx, options, env, self) {
			const token = tokens[idx];
			const srcIndex = token.attrIndex("src");

			if (srcIndex >= 0) {
				let src = token.attrs[srcIndex][1];

				// add assets/ if no folder is present
				if (!src.includes("/") && !src.startsWith("assets/")) {
				src = "assets/" + src;
				}

				// convert extension to .webp if needed
				if (!src.toLowerCase().endsWith(".webp") || !src.toLowerCase().endsWith(".gif")) {
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
		},
		markdownTemplateEngine: "njk", // use Nunjucks inside Markdown
    	htmlTemplateEngine: "njk",     // use Nunjucks inside .html files
    	dataTemplateEngine: "njk",     // use Nunjucks in .json/.yml/.js data files
	};
}
