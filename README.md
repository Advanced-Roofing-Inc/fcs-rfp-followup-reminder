# Requirements
- Node.js (http://nodejs.org) 9.3 or higher [(download)](http://nodejs.org)

# Setup
- Install project dependencies by running `npm install` from within the project root.
- Copy `.env.sample` file to `.env` and open file with a plain text editor (e.g. Notepad).

# Configuration
- Replace the default values in `.env` with desired settings.
- Note if values have a space, they must be surrounded with double-quotes, e.g. `EMAIL_FROM="from@email.com <John Doe>"`.
- The `RFP_AGES` parameter is comma-separated list of the days to send the RFPS out at. Value can be either a single number or several numbers separated by commas (no spaces), e.g. `RFP_AGES=7` or `RFP_AGES=3,7,14`.

# Usage
The script can be executed by running the command `npm start` from within the project directory root.

If the `npm` command is not available, you can also use the absolute path of the node installation, for example:
`"c:\program files\nodejs\9.3\npm.exe" --prefix "c:\path\to\project"`
