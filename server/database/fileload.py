from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from .query import execute_sql_query
import os
from fastapi import APIRouter

router = APIRouter(prefix="/api")
app = FastAPI()

@router.post('/upload/{board_id}')
async def upload_file(board_id: int, file: UploadFile = File(...)):
    try:
        UPLOAD_FOLDER = f'./uploadfolder/{board_id}'
        app.config = {"UPLOAD_FOLDER": UPLOAD_FOLDER}

        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        # 파일을 서버에 저장
        if os.path.exists(UPLOAD_FOLDER):
            files = os.listdir(UPLOAD_FOLDER)
            for current_file in files:
                file_path = os.path.join(UPLOAD_FOLDER, current_file)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                        print(f"File '{file_path}' deleted successfully.")
                except Exception as delete_error:
                    print(f"Error deleting file '{file_path}': {str(delete_error)}")

            print(f"All files in folder '{UPLOAD_FOLDER}' deleted successfully.")

        file_path = f"{app.config['UPLOAD_FOLDER']}/{file.filename}"
        with open(file_path, 'wb') as f:
            f.write(file.file.read())

        # 데이터베이스에 파일 경로 저장
        res = await execute_sql_query("SELECT * FROM file WHERE boardId = %s", (board_id,))
        print(res)
        if len(res) == 0:
            # 파일을 데이터베이스에 삽입
            await execute_sql_query('INSERT INTO file (boardId, fileName, filePath) VALUES (%s, %s, %s)', (board_id, file.filename, file_path))
            print("File path saved to database successfully.")
        else:
            await execute_sql_query("""
                UPDATE file
                SET fileName = %s, filePath = %s
                WHERE boardId = %s
            """, (file.filename, file_path, board_id,))

        return {'fileName': file.filename, 'filePath': file_path}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error: {str(e)}')


@router.get('/download/{board_id}')
async def download_file(board_id: int):
    
    fileName = await execute_sql_query("""SELECT fileName FROM file WHERE boardId = %s""",(board_id,))
    file_name = fileName[0]['fileName']
    print(file_name)
    UPLOAD_FOLDER = f'./uploadfolder/{board_id}'
    app.config = {"UPLOAD_FOLDER": UPLOAD_FOLDER}
    try:
        # 파일이 존재하는지 확인
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], file_name)
        if os.path.exists(file_path):
            return FileResponse(file_path, filename=os.path.basename(file_path))  # 파일 이름을 추출하여 전달
        else:
            raise HTTPException(status_code=404, detail="File not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error: {str(e)}')


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
