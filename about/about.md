---
title: rodri-go.net
layout: page_about_contact.njk
---

<h1 id="about-rodrigo">About Rodrigo</h1>

## Rodrigo Cardoso (he/him) is a designer, programmer and researcher interested in the ecological and social dimensions of digital technology.

His work questions how we build digital tools by examining how the socio-political values embedded in them, along with their infrastructure and energy use, shape people and the planet. Through acts of tinkering and repurposing, he exposes the hidden material and ideological dimensions of technology, helping build collective agency over the digital systems that underpin everyday life.

Rodrigo has a bachelor's in [Graphic Design](https://www.wdka.nl/programmes/graphic-design) with a minor in Digital Craft from Willem de Kooning Academy (Rotterdam, NL), a master's in Fine Art and Design from the [Non Linear Narrative](https://www.kabk.nl/en/programmes/master/non-linear-narrative) programme at the Royal Academy of Art (The Hague, NL), and has completed a full-stack web development bootcamp at Le Wagon (Cologne, DE). He has worked as a graphic designer and web developer.

<h1 id="contact">Contact</h1>

## Reach out to me directly at [rodrigo@rodri-go.net](mailto:rodrigo@rodri-go.net).

For code and software projects, see my [Github](https://github.com/rodri-go123). <br>
For video, see my [Vimeo](https://vimeo.com/user102586862). <br>
I occasionally post updates of my work on [Instagram](https://www.instagram.com/djingerale/).

<h1 id="about-website">About the website</h1>

## This site is designed to minimise energy use, based on _Low-tech Magazine's_ [guide](https://github.com/lowtechmag/solar/wiki/Solar-Web-Design) on how to build a low-tech website, while providing plenty of space to elaborate on each project.

To avoid server-side computation, this website is built with [Eleventy](https://www.11ty.dev/), a lightweight static site generator[^1]. Each build is done locally[^2], and only the generated files are uploaded to the server, reducing the number of files stored and served.

Every design choice prioritises low energy use and accessibility, including support for older machines and slower connections. Images are automatically compressed during the build process, helping reduce page size. The site uses default typefaces, avoids client-side JavaScript[^3] and displays each page’s size for transparency. Because much of my work is research-based, each project gets its own page in a blog-style layout. This format is heavier than a single-page design, but it provides space to fully explain each project.

This site is not meant as a definitive solution for 'sustainable' web development, many websites go further in their commitment minimise energy use. Rather, it represents my own contribution to a more energy-conscious internet: my personal approach to a 'low-tech' website.

[^1]: A program that builds the website as a series of pre-made pages without running code on a server each time a page gets accessed.
[^2]: Each time it gets updated, the site is generated on my own computer before being uploaded.
[^3]: Avoids extra code that would need your browser to run it.

{% include "size_summary.njk" %}