'use strict'
const cheerio = require("cheerio")
const superagent = require("superagent")
const fs = require("fs")
class PicCatcher{
	constructor(dirName,docHash,maxPage){
		this.domainInfo = "http://www.doczj.com"
		this.localPath = "./result/"
		this.docHash = docHash
		this.maxPage = maxPage
		this.dirName = dirName
		this.dirPath = this.localPath+dirName
		this.start()
	}
	start(){
		!fs.existsSync(this.dirPath)&&fs.mkdirSync(this.dirPath)
		let tasks = new Array(this.maxPage).fill("0").map((row,i)=>{
			return this.getPicture(i+1)
		})
		Promise.all(tasks).then(()=>{
			console.log("已完成")
		}).catch(e=>{
			console.log(e)
		})
	}
	getPicture(index){
		return new Promise((resolve,reject)=>{
			let domainInfo = this.domainInfo
			let docHash = this.docHash
			let url = `${domainInfo}/doc/${docHash}-${index}.html`
			superagent.get(url)
				.end((error,response)=>{
					if(error)return reject(error)
					let $ = cheerio.load(response.text)
					let pic = $("#contents p.img img").attr("src")
					pic = domainInfo+pic
					superagent.get(pic)
						.end((error,response)=>{
							if(error)return reject(error)
							let pic = response.body
							fs.writeFile(this.localPath+this.dirName+"/"+index+".jpg",pic)
							console.log("已保存："+this.dirName+"/"+index+".jpg")
							resolve()
						})
				})
		})
	}
}
new PicCatcher("建设工程合同疑难法律问题分析-谭敬慧-北仲","9b535733aaea998fcc220ea5",67)