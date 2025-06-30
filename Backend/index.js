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

app.post('/api/addContent', async (req, res) => {
  try {
    const content = req.body.content;
    
    // Split the content into sentences
    // This regex splits by period, exclamation mark, or question mark followed by a space or end of string
    const sentences = content.split(/(?<=[.!?])\s+|(?<=[.!?])$/);
    
    await doc.loadInfo();
    
    // Check if Content sheet exists
    let contentSheet;
    try {
      contentSheet = doc.sheetsByTitle['Content'];
      if (!contentSheet) {
        // Try by index if not found by title
        contentSheet = doc.sheetsByIndex[2];
      }
    } catch (err) {
      console.log('Sheet not found, creating new one:', err);
    }
    
    // If sheet doesn't exist or has no header row, create or update it
    if (!contentSheet) {
      console.log('Creating new Content sheet with headers');
      contentSheet = await doc.addSheet({ 
        title: 'Content', 
        headerValues: ['Sentence'] 
      });
    } else {
      // Check if the sheet has headers
      const rows = await contentSheet.getRows();
      if (contentSheet.headerValues.length === 0 || !contentSheet.headerValues.includes('Sentence')) {
        console.log('Setting headers for existing sheet');
        
        // Get all current data
        const currentData = rows.map(row => row._rawData);
        
        // Clear the sheet
        await contentSheet.clear();
        
        // Set the headers
        await contentSheet.setHeaderRow(['Sentence']);
        
        // Re-add the data if any exists
        if (currentData.length > 0) {
          const formattedData = currentData.map(row => ({ 'Sentence': row[0] }));
          await contentSheet.addRows(formattedData);
        }
      }
    }
    
    console.log('Content sheet:', contentSheet.title, 'with header values:', contentSheet.headerValues);
    
    // Clear existing content
    const rows = await contentSheet.getRows();
    console.log('Existing rows count:', rows.length);
    
    for (const row of rows) {
      await row.delete();
    }
    
    // Add new content sentences
    const data = sentences
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => ({
        'Sentence': sentence.trim()
      }));
    
    console.log('Adding sentences:', data.length);
    
    if (data.length > 0) {
      const addedRows = await contentSheet.addRows(data);
      console.log('Added rows:', addedRows.length);
    }
    
    res.status(200).json({ 
      message: "Content Added", 
      sentencesCount: data.length,
      sheetTitle: contentSheet.title
    });
  } catch (error) {
    console.error('Error Adding Content', error);
    res.status(500).json({ message: 'Failed', error: error.message });
  }
});

app.get('/api/fetchContent', async (req, res) => {
  try {
    await doc.loadInfo();
    
    // Check if Content sheet exists
    let contentSheet;
    try {
      contentSheet = doc.sheetsByTitle['Content'];
      if (!contentSheet) {
        // Try by index if not found by title
        contentSheet = doc.sheetsByIndex[2];
      }
    } catch (err) {
      console.log('Sheet not found for fetch, creating new one:', err);
      contentSheet = await doc.addSheet({ title: 'Content', headerValues: ['Sentence'] });
    }
    
    if (!contentSheet) {
      contentSheet = await doc.addSheet({ title: 'Content', headerValues: ['Sentence'] });
    }
    
    console.log('Fetching from Content sheet:', contentSheet.title);
    
    const rows = await contentSheet.getRows();
    console.log('Found rows:', rows.length);
    
    const sentences = rows.map(row => {
      // Check both _rawData (for backward compatibility) and direct property access
      return row._rawData?.[0] || row.Sentence || '';
    }).filter(sentence => sentence.trim().length > 0);
    
    console.log('Returning sentences:', sentences.length);
    
    res.status(200).json({ 
      message: "Content Fetched", 
      data: sentences,
      sheetTitle: contentSheet.title
    });
  } catch (error) {
    console.error('Error Fetching Content', error);
    res.status(500).json({ message: 'Failed', error: error.message });
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

// Braille Training API Endpoints

app.post('/api/addBrailleResults', async (req, res) => {
  try {
    const rawData = req.body;
    const letterTraining = rawData.letterTraining;
    const wordTraining = rawData.wordTraining;
    const sessionData = rawData.sessionData;

    await doc.loadInfo(); 
    
    // Check if Braille Results sheet exists, create if not
    let brailleSheet;
    try {
      brailleSheet = doc.sheetsByTitle['Braille Results'];
    } catch (err) {
      console.log('Creating Braille Results sheet');
      brailleSheet = await doc.addSheet({ 
        title: 'Braille Results',
        headerValues: [
          'Student Name', 'Session Date', 'Total Time (minutes)',
          'Letter Training Accuracy (%)', 'Letter Training Errors', 'Letter Training Time (minutes)',
          'Word Training Accuracy (%)', 'Word Training Errors', 'Word Training Time (minutes)',
          'Overall Accuracy (%)', 'Total Errors', 'Session Complete'
        ]
      });
    }

    const data = [{
        'Student Name': rawData.studentName,
        'Session Date': new Date().toISOString().split('T')[0],
        'Total Time (minutes)': Math.round((sessionData?.totalTime || 0) / 60000 * 100) / 100,
        'Letter Training Accuracy (%)': Math.round((letterTraining?.overallStats?.accuracy || 0) * 100) / 100,
        'Letter Training Errors': letterTraining?.overallStats?.totalErrors || 0,
        'Letter Training Time (minutes)': Math.round((letterTraining?.overallStats?.totalTime || 0) / 60000 * 100) / 100,
        'Word Training Accuracy (%)': Math.round((wordTraining?.overallStats?.accuracy || 0) * 100) / 100,
        'Word Training Errors': wordTraining?.overallStats?.totalErrors || 0,
        'Word Training Time (minutes)': Math.round((wordTraining?.overallStats?.avgTimePerWord || 0) / 1000 * 100) / 100,
        'Overall Accuracy (%)': Math.round((sessionData?.overallAccuracy || 0) * 100) / 100,
        'Total Errors': sessionData?.totalErrors || 0,
        'Session Complete': sessionData?.phasesCompleted?.includes('word') ? 'Yes' : 'No'
    }];
    
    const addRow = await brailleSheet.addRows(data);
    res.status(200).json({ message: "Braille results added successfully", data: data });
  } catch (error) {
    console.error('Error adding Braille results', error);
    res.status(500).json({ message: 'Failed to add Braille results', error: error.message });
  }
});

app.post('/api/addBrailleLetterStats', async (req, res) => {
  try {
    const { studentName, letterStats } = req.body;

    await doc.loadInfo();
    
    // Check if Letter Stats sheet exists, create if not
    let letterStatsSheet;
    try {
      letterStatsSheet = doc.sheetsByTitle['Letter Stats'];
    } catch (err) {
      console.log('Creating Letter Stats sheet');
      letterStatsSheet = await doc.addSheet({
        title: 'Letter Stats',
        headerValues: [
          'Student Name', 'Letter', 'Attempts', 'Correct Attempts', 'Accuracy (%)',
          'Average Time (ms)', 'Fastest Time (ms)', 'Slowest Time (ms)', 'Date'
        ]
      });
    }

    const data = Object.keys(letterStats).map(letter => ({
      'Student Name': studentName,
      'Letter': letter.toUpperCase(),
      'Attempts': letterStats[letter].attempts,
      'Correct Attempts': letterStats[letter].correct,
      'Accuracy (%)': Math.round((letterStats[letter].correct / letterStats[letter].attempts) * 100),
      'Average Time (ms)': Math.round(letterStats[letter].averageTime),
      'Fastest Time (ms)': letterStats[letter].fastestTime,
      'Slowest Time (ms)': letterStats[letter].slowestTime,
      'Date': new Date().toISOString().split('T')[0]
    }));

    const addRows = await letterStatsSheet.addRows(data);
    res.status(200).json({ message: "Letter stats added successfully", data: data });
  } catch (error) {
    console.error('Error adding letter stats', error);
    res.status(500).json({ message: 'Failed to add letter stats', error: error.message });
  }
});

app.post('/api/addBrailleWordStats', async (req, res) => {
  try {
    const { studentName, wordStats } = req.body;

    await doc.loadInfo();
    
    // Check if Word Stats sheet exists, create if not
    let wordStatsSheet;
    try {
      wordStatsSheet = doc.sheetsByTitle['Word Stats'];
    } catch (err) {
      console.log('Creating Word Stats sheet');
      wordStatsSheet = await doc.addSheet({
        title: 'Word Stats',
        headerValues: [
          'Student Name', 'Word', 'Attempts', 'Completed', 'Accuracy (%)',
          'Total Time (ms)', 'Errors', 'Date'
        ]
      });
    }

    const data = Object.keys(wordStats).map(word => ({
      'Student Name': studentName,
      'Word': word.toLowerCase(),
      'Attempts': wordStats[word].attempts,
      'Completed': wordStats[word].completed ? 'Yes' : 'No',
      'Accuracy (%)': Math.round((wordStats[word].accuracy || 0) * 100) / 100,
      'Total Time (ms)': wordStats[word].totalTime || 0,
      'Errors': wordStats[word].errors?.length || 0,
      'Date': new Date().toISOString().split('T')[0]
    }));

    const addRows = await wordStatsSheet.addRows(data);
    res.status(200).json({ message: "Word stats added successfully", data: data });
  } catch (error) {
    console.error('Error adding word stats', error);
    res.status(500).json({ message: 'Failed to add word stats', error: error.message });
  }
});

app.get('/api/fetchBrailleResults', async (req, res) => {
  try {
    await doc.loadInfo();
    
    let brailleSheet;
    try {
      brailleSheet = doc.sheetsByTitle['Braille Results'];
    } catch (err) {
      return res.status(200).json({ message: "No Braille results found", data: [] });
    }

    const rows = await brailleSheet.getRows();
    const results = rows.map(row => ({
      studentName: row._rawData[0],
      sessionDate: row._rawData[1],
      totalTime: row._rawData[2],
      letterAccuracy: row._rawData[3],
      letterErrors: row._rawData[4],
      letterTime: row._rawData[5],
      wordAccuracy: row._rawData[6],
      wordErrors: row._rawData[7],
      wordTime: row._rawData[8],
      overallAccuracy: row._rawData[9],
      totalErrors: row._rawData[10],
      sessionComplete: row._rawData[11]
    }));

    res.status(200).json({ message: "Braille results fetched successfully", data: results });
  } catch (error) {
    console.error('Error fetching Braille results', error);
    res.status(500).json({ message: 'Failed to fetch Braille results', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
