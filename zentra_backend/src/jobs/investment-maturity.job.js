const investmentService =
  require(
    "../modules/investments/investments.service"
  );

const runInvestmentMaturityJob =
  async () => {
    try {
      const count =
        await investmentService.markAllMatured();

      if (count > 0) {
        console.log(
          `[Investment Maturity] ${count} investment(s) marked as matured`
        );
      }
    } catch (error) {
      console.error(
        "[Investment Maturity] Failed:",
        error
      );
    }
  };

module.exports = {
  runInvestmentMaturityJob,
};