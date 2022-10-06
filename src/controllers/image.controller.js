const uploadFile = require("../middlewares/upload");
const fs = require("fs");
const config = require('../config/config');

const upload = async (req, res) => {
    try {
        await uploadFile(req, res);

        if (req.file === undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }

        console.log('Error here', req, req.file);
        res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.filename,
        });
    } catch (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 5MB!",
            });
        }

        console.log('err', err);
        res.status(500).send({
            message: `Could not upload the file. ${err}`,
        });
    }
};

const getListFiles = (req, res) => {
    const directoryPath = __basedir + "/static/uploads/images";
    const baseUrl = config.BASE_URL;

    fs.readdir(directoryPath, function (err, files) {
        if (err || !files) {
            res.status(500).send({
                message: "Unable to scan files!",
            });
            return;
        }

        let fileInfos = [];

        console.log('Files', files);

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: baseUrl + file,
            });
        });

        res.status(200).send(fileInfos);
    });
};

const download = (req, res) => {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/static/uploads/images";

    res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
};

const deleteFile = (req, res) => {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/static/uploads/images";
    const path = directoryPath + '/' + fileName;
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
            return;
        }

        res.status(200).send({
            message: "File deleted successfully!",
        });
        //file removed
    });
};

module.exports = {
    upload,
    getListFiles,
    deleteFile,
    download,
};
