const link = (title, href) => ({ title, href });

export function sampleEntries(promoImage) {
  return [
    {
      title: "Product",
      order: 1,
      link: link("Product", "/product"),
      columns: [
        {
          sections: [{
            heading: "Explore",
            links: [
              link("Product overview", "/product"),
              link("Pricing", "/pricing"),
              link("Customers", "/customers"),
            ],
          }],
          promo_image: promoImage,
          promo_link: link("See the product", "/product"),
          footer_link: link("All features", "/product"),
        },
        {
          sections: [{
            heading: "Plan",
            links: [
              link("Task boards", "/product#task-boards"),
              link("Timelines", "/product#timelines"),
              link("Roadmaps", "/product#roadmaps"),
              link("Goals", "/product#goals"),
            ],
          }],
          footer_link: link("How planning works", "/product#how-a-team-ships"),
        },
        {
          sections: [{
            heading: "Track",
            links: [
              link("Live reporting", "/product#live-reporting"),
              link("Dashboards", "/product#dashboards"),
              link("Workload", "/product#workload"),
              link("AI summaries", "/product#ai-summaries"),
            ],
          }],
          footer_link: link("See reporting", "/product#live-reporting"),
        },
        {
          sections: [
            { heading: "Platform", links: [link("Security", "/security"), link("Resources", "/resources")] },
            { heading: "Company", links: [link("About", "/about"), link("Contact", "/contact")] },
          ],
          footer_link: link("Talk to us", "/contact"),
        },
      ],
    },
    {
      title: "Solutions",
      order: 2,
      link: link("Solutions", "/solutions"),
      columns: [
        {
          sections: [{
            heading: "Popular",
            links: [
              link("Product teams", "/solutions#product"),
              link("Engineering", "/solutions#engineering"),
              link("Client work", "/solutions#operations"),
            ],
          }],
          promo_image: promoImage,
          promo_link: link("Customer stories", "/customers"),
          footer_link: link("All solutions", "/solutions"),
        },
        {
          sections: [{
            heading: "By team",
            links: [
              link("Product", "/solutions#product"),
              link("Engineering", "/solutions#engineering"),
              link("Marketing", "/solutions#marketing"),
              link("Operations", "/solutions#operations"),
            ],
          }],
          footer_link: link("Compare teams", "/solutions"),
        },
        {
          sections: [{
            heading: "By size",
            links: [
              link("Startups", "/solutions#startups"),
              link("Mid-market", "/solutions#mid-market"),
              link("Enterprise", "/solutions#enterprise"),
            ],
          }],
          footer_link: link("See pricing", "/pricing"),
        },
        {
          sections: [{
            heading: "Learn",
            links: [
              link("Guides", "/resources#guides"),
              link("Templates", "/resources#templates"),
              link("Webinars", "/resources#webinars"),
            ],
          }],
          footer_link: link("All resources", "/resources"),
        },
      ],
    },
  ];
}
