require('dotenv').config();
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const bodyParser = require('body-parser');
const { JWT } = require('google-auth-library');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.options('*', cors());

const serviceAccountAuth = new JWT({
  email: "ili-app@ili-app-449417.iam.gserviceaccount.com",
  key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCgiCm9HGu04GHV\nlTbi+SHjqCZu+4nsAOjpO8Qa80iZGG8zQfkROk6yKFLwd5Ml7DCvlLYdjgkfNaJA\ndvyu7lalAjvVKmhIa8ZJcgwfn8MVk4YPIeQ9Frl9iHOXJ3x79tSrLtIZMY4Az96M\ntKCydQmKqN8yqGj/Q8ICvXaTa2UCAR9GENsuujWhUUNQp8e5ln+UQm1MVL0B52a7\nkJxzn8CHGc3IIx+/tvg0zyb0aWiHeh4/qOIzAuV2m1kQAOlzb1zDew7ntRGjZ8Q6\nZBDgVn0sSdNeBqpvKD3bHOKBd9jWYw0zvU8tmY8QVubQuICF0fIMfVfXhXRzbPdg\nPVD1ioljAgMBAAECggEABMgJdjiCfMCyKUpoeBoziDRZ8LRNR1o/lbLSBHt6jhTM\nOxqb8IdsEKJi1ga5u0dtq80iH387hlJyorjojc1Lh16pqY+5y25qWYWsFsULanka\nZRj9U1R58eM+jiH+8zJG41Jhr55qPFv0pPw8TRRvVFHzU+7wMaoy/SHnhjyMpaKW\n0dNC9eWuuEepp6pGPKpxJtbnVmCsbGpvkpRUTQr+umJxrtlyERlUO/vOjF8xBEL/\n8pUpSovfVr+LX1nW0POMBOQ82DICQZmy6VPB4B+xHVTwdTkI2JK20b1tgns+BmMP\n9FhSTxQ/y5Br0hwK7QDLDIFq682covRgpK9rCXsFAQKBgQDYV7Pg8AKFDichaic5\nxTeQojBf/xPaYCqKyiyA2BMVc2Ikx+IJoHugLoVmE6sy27jQOtzxEdReSAnuXpNL\nW3wn71RkAhE62A4NU1wVgC/Bi+uIGx1QK6dfkhQSKKXILeFqRmSs+zyCM1EbQbP2\nn9PTe7Oe6ILbuuVeYZNf/C7d3QKBgQC99W88MP5tsc2NAUP6KL2lVbxCHgn15hWE\nNAbgrG2/WuhwLPVs3slVOr3hYQoX10s+mRw4gyCkNxuhZTQnK5MUPyI+QAUXXsQj\nns/0kk5wec3MBumbGh5TNZeZzS5Tl5OwpOqlbEHrUGdzGHpviCC8TAFndkjVf72u\n42CI/MKwPwKBgQC6U269AHlrFzFkegSmoNCmZMm9I/d5UPHS7yU9Itvs0Z9phi2L\nlQhkgSyrKa188/hMfyXjCjQZr3m+Lv41HOnlix7ns1AbmhEgMPdSHUEENPn6E0A/\n2BkjGrDmotOFgN5vpYj34rnOeVwVWZUhh63sqtGcvyxVCraZfvhq5suGkQKBgQCe\n6nRLi8VeqbAHtbZT0r+NUON1AMJeeEUp24ihbz9FJd1s8v/DO8J9Te5KXa9e8Jsf\nXGHymSi2mO/BnvP5jQe3mXWhVFeuDHbUQelBdyCuEghsFqBaRIh4Hk6cub1260kA\nL4eqKp4fKZ3R+Pl80wpn3MIT9y3Jhtt+MvSwxZxuawKBgQC69jH9ZzBpAIb5fLRS\nNBMNW0Y9N0zv/YO362G/32eP0uoU20v5ZhudHvH37Hsom2bfh7pqtruBzBte+Z3c\nSrVjtBiXRFdFGnN4kQa1UXBkC79h8hSRsDJeJlrBydHN0vOP4kMD/2W1q5GKTR5P\nxfITR/qrRAwsB7dCz0uCcqpbuQ==\n-----END PRIVATE KEY-----\n",
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const doc = new GoogleSpreadsheet('1pA3VyiVUa29FqiPW6LukGAdTpEQg_Uv8juQsaL-RZbw', serviceAccountAuth);

app.post('/api/addToSheet', async (req, res) => {
  try {
    const rawData = req.body;
    const lectureInfo = rawData.lectureInfo;

    // Sum the audio times and text times
    const totalAudioTime = ['pageAudio1', 'pageAudio2', 'pageAudio3', 'pageAudio4', 'pageAudio5'].reduce((sum, key) => sum + (parseFloat(lectureInfo[key]) || 0), 0);
    const totalTextTime = ['pageText1', 'pageText2', 'pageText3', 'pageText4', 'pageText5'].reduce((sum, key) => sum + (parseFloat(lectureInfo[key]) || 0), 0);

    await doc.loadInfo(); 
    const sheet = doc.sheetsByIndex[0];
    const data = [{
        'Student Name' : rawData['studentInfo']['name'],
        'Pre Test Score' : rawData['preTestInfo']['score'],
        'Pre Test Time': rawData['preTestInfo']['timeTaken'], 
        'Lecture Audio Time': totalAudioTime,
        'Lecture Text Time': totalTextTime,
        'Post Test Score': rawData['postTestInfo']['score'],
        'Post Test Time': rawData['postTestInfo']['timeTaken'],
        'Before Pre Test Heart Rate' : rawData['beforePreTestHeart'],
        'After Pre Test Heart Rate' : rawData['afterPreTestHeart'],
        'Before Lecture Heart Rate' : rawData['beforeLectureHeart'],
        'After Lecture Heart Rate' : rawData['afterLectureHeart'],
        'Before Post Test Heart Rate' : rawData['beforePostTestHeart'],
        'After Post Test Heart Rate' : rawData['afterPostTestHeart'],
        
        'Audio Time 1': lectureInfo?.pageAudio1 || '',
        'Audio Time 2': lectureInfo?.pageAudio2 || '',
        'Audio Time 3': lectureInfo?.pageAudio3 || '',
        'Audio Time 4': lectureInfo?.pageAudio4 || '',
        'Audio Time 5': lectureInfo?.pageAudio5 || '',
        'Text Time 1': lectureInfo?.pageText1 || '',
        'Text Time 2': lectureInfo?.pageText2 || '',
        'Text Time 3': lectureInfo?.pageText3 || '',
        'Text Time 4': lectureInfo?.pageText4 || '',
        'Text Time 5': lectureInfo?.pageText5 || '',
        'Complete Student Information': '',
        'Question wise Pre Test Data': rawData['preTestInfo']['questionData'],
        'Question wise Post Test Data': rawData['postTestInfo']['questionData'],
        'Lecture Audio Complete Data': rawData['audioRawData'],
        'Lecture Text Complete Data': ''
    }];
    const addRow = await sheet.addRows(data);
    res.status(200).json({ message: "Data Saved" });
  } catch (error) {
    console.error('Error adding data to Google Sheet', error);
    res.status(500).json({ message: 'Failed to add data to Google Sheet' });
  }
});

app.get('/api/fetchQuestions', async (req, res) => {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[1];
    const rows = await sheet.getRows();
    const jsonSheet = rows.map(row => row._rawData);
    res.status(200).json({ message: "Data Saved", data: jsonSheet });
  } catch (error) {
    console.error('Error Fetching Data', error);
    res.status(500).json({ message: 'Failed' });
  }
});

app.post('/api/deleteQuestion', async (req, res) => {
  try {
    const question = req.body['Question'];
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[1];
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row._rawData[0] === question);
    if (rowToDelete) {
      await rowToDelete.delete();
      res.status(200).json({ message: "Question Deleted" });
    } else {
      res.status(404).json({ message: "Question not found" });
    }
  } catch (error) {
    console.error('Error Deleting Question', error);
    res.status(500).json({ message: 'Failed' });
  }
});

app.post('/api/addQuestion', async (req, res) => {
  try {
    const newQuestion = req.body;
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[1];
    const data = [{
        'Question': newQuestion['Question'],
        'Options': newQuestion['Options'],
        'Answer': newQuestion['Correct'],
    }];
    const addRow = await sheet.addRows(data);
    res.status(200).json({ message: "Question Added", data: data });
  } catch (error) {
    console.error('Error Adding Question', error);
    res.status(500).json({ message: 'Failed' });
  }
});

app.get('/api/test', async (req, res) => {
  try {
    res.status(200).json({ message: 'Connection Works' });
  } catch (error) {
    console.error('Error connecting', error);
    res.status(500).json({ message: 'Failed to Connect' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
