
describe('Spaced Repetition Script', () => {
  
  // 'beforeEach' is a setup function that runs before each 'test' block in this suite.
  // We use it to create a fresh, virtual DOM for every test to ensure they are isolated.
  beforeEach(() => {
    // Set the body's HTML to a simplified version of index.html,
    // containing all the elements that script.mjs needs to find.
    document.body.innerHTML = `
      <form id="add-topic"></form>
      <input id="topic-name" />
      <input type="date" id="start-date" />
      <select id="user-select"></select>
      <p id="NoData"></p>
      <table id="userData">
        <tbody id="userInfo"></tbody>
      </table>
    `;
  });

  describe('calculateReviewDates', () => {
    test('should calculate the correct revision dates for a standard date', async () => {
      // Use dynamic import to load the module *after* the DOM has been set up.
      // 'await import()' ensures the module is fully loaded before we proceed.
      const { calculateReviewDates } = await import('./script.mjs');
      const startDate = '2026-07-19';
      const result = calculateReviewDates(startDate);
      const expectedDates = [
        '2026-07-26',
        '2026-08-19',
        '2026-10-19',
        '2027-01-19',
        '2027-07-19',
      ];
      expect(result).toEqual(expectedDates);
    });
    test('should handle month-end and year transitions correctly', async () => {
      const { calculateReviewDates } = await import('./script.mjs');
      const startDate = '2027-11-05';
      const result = calculateReviewDates(startDate);
      const expectedDates = [
        '2027-11-12', // +7 days
        '2027-12-05', // +1 month
        '2028-02-05', // +3 months (crosses into a leap year)
        '2028-05-05', // +6 months
        '2028-11-05', // +1 year
      ];
      expect(result).toEqual(expectedDates);
    });
  });
});