module.exports = (app) => {
  const notFound = (req, res, next) => {
    try {
      return res.status(404).send(
        `<div style="padding: 4rem;
                color: #1280a5;
                font-size: 22px;
                font-family: Impact, fantacy;
                ">
                <strong>404 || Requested resource not Found</strong>
        </div>`
      );
    } catch (error) {
      next(error);
    }
  };

  app.use(notFound);
};
