from datetime import timedelta, datetime
import re

def calculate_total_time(time_data):
    total_time = sum([timedelta(hours=item["hours"], minutes=item["minutes"]) for item in time_data], timedelta())
    return total_time

def format_timedelta(td):
    days, seconds = td.days, td.seconds
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    return f"{days}일 {hours}시간 {minutes}분"

# 사용자 입력 받기
timeData = {"date": "", "hours": 0, "minutes": 0}
for key in timeData.keys():
    timeData[key] = input("%s: " % key)

# Markdown 파일 읽기
try:
    with open("TIL\\spendtime.md", "r", encoding="utf-8") as file:
        content = file.read()
except FileNotFoundError:
    content = ""

# 기존 시간 데이터 추출
time_data_matches = re.finditer(r'# (\d+\.\d+\.\d+)\n\n(\d+)시간 (\d+)분', content)
time_data = [{"date": match.group(1), "hours": int(match.group(2)), "minutes": int(match.group(3))} for match in time_data_matches]

# 입력한 데이터가 이미 있는지 확인
existing_data = next((item for item in time_data if item["date"] == timeData["date"]), None)

if existing_data:
    # 이미 있는 데이터 업데이트
    existing_data["hours"] += int(timeData["hours"])
    existing_data["minutes"] += int(timeData["minutes"])
else:
    # 입력한 데이터 추가
    new_time_data = {"date": timeData["date"], "hours": int(timeData["hours"]), "minutes": int(timeData["minutes"])}
    time_data.append(new_time_data)

# 총 소요 시간 계산
total_time = calculate_total_time(time_data)

# 새로운 시간 데이터를 Markdown 파일에 추가
with open("TIL\\spendtime.md", "a", encoding="utf-8") as file:
    new_time_data_text = f"\n\n# {timeData['date']}\n\n{timeData['hours']}시간 {timeData['minutes']}분\n"
    file.write(new_time_data_text)
    print("New Time Data Added to File:", new_time_data_text)

# 업데이트된 총 소요 시간을 Markdown 파일에 추가
with open("TIL\\spendtime.md", "a", encoding="utf-8") as file:
    total_time_text = f"\n\n## TOTAL SPENT TIME\n\n{format_timedelta(total_time)}\n"
    file.write(total_time_text)
    print("Total Time Updated in File:", total_time_text)
