import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
server=ThreadingHTTPServer(('127.0.0.1',3000), SimpleHTTPRequestHandler)
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1100})
 errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)))
 page.goto('http://127.0.0.1:3000')
 page.wait_for_selector('#particles g')
 for i,(temp,water,acid,base) in enumerate([('22.23',2,0,8),('22.46',4,0,4),('22.69',6,0,0),('22.46',4,4,0)]):
  page.locator(f'[data-case="{i}"]').click()
  assert page.locator('#status').inner_text()=='반응 중'
  page.wait_for_function("document.querySelector('#status').textContent === '반응 완료'")
  assert page.locator('#temperature').inner_text()==temp
  for label,n in [('H₂O',water),('H⁺',acid),('OH⁻',base)]:
   assert page.locator(f'[data-label="{label}"]').count()==n
  page.locator('#start').click()
  page.wait_for_function("document.querySelector('#status').textContent === '반응 완료'")
  assert page.locator('#temperature').inner_text()==temp
  print('PASS automatic selection and replay',i+1)
 page.locator('[data-case="0"]').click()
 page.wait_for_timeout(150)
 page.locator('[data-case="1"]').click()
 page.locator('[data-case="2"]').click()
 page.locator('[data-case="3"]').click()
 page.wait_for_function("document.querySelector('#status').textContent === '반응 완료'")
 assert page.locator('#temperature').inner_text()=='22.46'
 assert page.locator('#state').inner_text()=='산성'
 page.locator('[data-case="0"]').click()
 page.locator('#reset').click()
 page.wait_for_timeout(4500)
 assert page.locator('#status').inner_text()=='혼합 전'
 assert page.locator('#temperature').inner_text()=='22.00'
 page.emulate_media(reduced_motion='reduce')
 page.locator('[data-case="2"]').click()
 page.wait_for_function("document.querySelector('#status').textContent === '반응 완료'")
 # Browser assertions are sufficient; no screenshots are written by this test.
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 assert page.locator('.school-wordmark').is_visible()
 assert not errors,errors
 print('PASS rapid switching, reset cancellation, reduced motion, mobile school wordmark; no JS errors')
 browser.close()
server.shutdown()
