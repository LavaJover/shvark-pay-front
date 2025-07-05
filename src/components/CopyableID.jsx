import { useState } from 'react'
import {Tooltip} from 'react-tooltip'

export const CopyableId = ({ id }) => {
    const [copied, setCopied] = useState(false)
    const shortId = id.substring(0, 8) + '...'

    const copyToClipboard = () => {
        navigator.clipboard.writeText(id)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Сброс через 2 секунды
          })
          .catch(err => {
            console.error('Ошибка копирования:', err);
          });
         };

      return (
        <>
          <span 
            onClick={copyToClipboard}
            style={{
              cursor: 'pointer',
              textDecoration: 'underline dotted',
              color: '#007bff',
              display: 'inline-block',
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            data-tooltip-id={`tooltip-${id}`}
          >
            {shortId}
          </span>
          
          <Tooltip id={`tooltip-${id}`} place="top">
            {copied ? 'Скопировано!' : 'Нажмите, чтобы скопировать'}
          </Tooltip>
        </>
    );
};